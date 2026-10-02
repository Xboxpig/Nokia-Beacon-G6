#!/usr/bin/env python3
"""Convert an OpenSSL DER ECDSA signature into Nokia Password2 token format.

Nokia format: [1-byte R length][R magnitude bytes][S magnitude bytes], Base64 encoded.
"""
import base64
import sys
from pathlib import Path


def read_len(data: bytes, i: int):
    if i >= len(data):
        raise ValueError("truncated DER length")
    n = data[i]
    i += 1
    if n < 0x80:
        return n, i
    count = n & 0x7F
    if count == 0 or count > 4 or i + count > len(data):
        raise ValueError("unsupported/truncated DER length")
    n = int.from_bytes(data[i:i+count], "big")
    return n, i + count


def read_tlv(data: bytes, i: int, tag: int):
    if i >= len(data) or data[i] != tag:
        raise ValueError(f"expected DER tag 0x{tag:02x} at offset {i}")
    length, j = read_len(data, i + 1)
    end = j + length
    if end > len(data):
        raise ValueError("truncated DER value")
    return data[j:end], end


def magnitude(x: bytes) -> bytes:
    # DER INTEGER is signed. ECDSA r/s are positive and may get one 00 sign pad.
    while len(x) > 1 and x[0] == 0:
        x = x[1:]
    if not x:
        x = b"\x00"
    return x


def convert(der: bytes) -> str:
    seq, end = read_tlv(der, 0, 0x30)
    if end != len(der):
        raise ValueError("trailing bytes after DER sequence")
    r_raw, pos = read_tlv(seq, 0, 0x02)
    s_raw, pos2 = read_tlv(seq, pos, 0x02)
    if pos2 != len(seq):
        raise ValueError("trailing bytes inside DER sequence")
    r = magnitude(r_raw)
    s = magnitude(s_raw)
    if len(r) > 255:
        raise ValueError("R is too large for Nokia one-byte length field")
    raw = bytes([len(r)]) + r + s
    return base64.b64encode(raw).decode("ascii")


def main():
    if len(sys.argv) != 2:
        print(f"usage: {Path(sys.argv[0]).name} signature.der", file=sys.stderr)
        return 2
    try:
        print(convert(Path(sys.argv[1]).read_bytes()))
        return 0
    except (OSError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
