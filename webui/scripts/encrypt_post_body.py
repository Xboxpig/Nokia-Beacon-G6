import base64
import os
from Crypto.Cipher import AES, PKCS1_v1_5
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import pad

# --- Configuration ---
CSRF_TOKEN = "SgjkUxjsowWEdcMF"                # from localStorage
RSA_PUBLIC_KEY_PEM = """-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHiJngL4akZbgpZt/rSCIwfEvo0CNafirTZOZaQuSFQ//77BLu+MPx7BcluhQEiUyojreFwUYYaKpDtAydF59gvlqripPwlkHzkVHTxGZnOTLhbPD/H0EK9RToK3/ABvnxN1tDx9fkZQ0FVlF1BqxIqUAqJdmQMINM+rFE/sehawIDAQAB
-----END PUBLIC KEY-----"""

# --- Encryption Helpers (matching the web UI) ---
def sjcl_base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def custom_base64url_for_ck(data: bytes) -> str:
    s = base64.urlsafe_b64encode(data).decode()
    return s.replace('+', '-').replace('/', '_').replace('=', '.')

def encrypt_payload(plaintext: str):
    # 1. AES key and IV: 16 random bytes each
    aes_key = os.urandom(16)
    aes_iv = os.urandom(16)

    # 2. AES-CBC encrypt the plaintext
    cipher_aes = AES.new(aes_key, AES.MODE_CBC, aes_iv)
    ct_bytes = cipher_aes.encrypt(pad(plaintext.encode(), AES.block_size))

    # 3. RSA encrypt the concatenated key and IV (standard base64)
    key_b64 = base64.b64encode(aes_key).decode()
    iv_b64 = base64.b64encode(aes_iv).decode()
    combined = f"{key_b64} {iv_b64}"
    rsa_key = RSA.import_key(RSA_PUBLIC_KEY_PEM)
    cipher_rsa = PKCS1_v1_5.new(rsa_key)
    rsa_ciphertext = cipher_rsa.encrypt(combined.encode())

    # 4. ct: base64url of AES ciphertext
    ct = sjcl_base64url_encode(ct_bytes)
    # 5. ck: custom base64url of RSA ciphertext
    ck = custom_base64url_for_ck(rsa_ciphertext)
    return ck, ct


ip = '192.168.18.22'
# plaintext = f"Status=true&RemoteLogLevel=7&ServerIPAddress={ip}&ServerPortNumber=514&csrf_token={CSRF_TOKEN}"

plaintext = f"ipversion=ipv4&iface=ipaddr={ip}&checkall=ping&pingcount=4&packetlength=64&tracehops=30&csrf_token={CSRF_TOKEN}"

ck, ct = encrypt_payload(plaintext)
body = f"encrypted=1&ct={ct}&ck={ck}"
print(body)