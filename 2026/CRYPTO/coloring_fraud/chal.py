#!/usr/local/bin/python

import os
from random import SystemRandom

random = SystemRandom()

MASK32 = 0xFFFFFFFF

def rotl32(x, r):
    x &= MASK32
    return ((x << r) | (x >> (32 - r))) & MASK32

def bytes_to_u32le_words(b):
    assert len(b) % 4 == 0
    out = []
    for i in range(0, len(b), 4):
        out.append(int.from_bytes(b[i:i + 4], "little"))
    return out

def u32le_words_to_bytes(words):
    return b"".join((w & MASK32).to_bytes(4, "little") for w in words)

def xor_bytes(a, b):
    return bytes(x ^ y for x, y in zip(a, b))

def bit_get(x, i):
    return (x >> i) & 1

def set_bit_in_bytes(buf, bit_index):
    byte_i = bit_index // 8
    bit_i = bit_index % 8
    buf[byte_i] |= (1 << bit_i)

def pad10star1(msg, rate_bytes):
    out = bytearray(msg)
    out.append(0x01)
    while (len(out) % rate_bytes) != (rate_bytes - 1):
        out.append(0x00)
    out.append(0x80)
    return bytes(out)

_RC12 = [
    0x00000058, 0x00000038, 0x000003C0, 0x000000D0,
    0x00000120, 0x00000014, 0x00000060, 0x0000002C,
    0x00000380, 0x000000F0, 0x000001A0, 0x00000012,
]

def permute_full(state, rounds=12):
    assert len(state) == 12
    for r in range(rounds):
        p = [state[x] ^ state[x + 4] ^ state[x + 8] for x in range(4)]
        e = [rotl32(p[(x - 1) & 3], 5) ^ rotl32(p[(x - 1) & 3], 14) for x in range(4)]
        for x in range(4):
            state[x] ^= e[x]
            state[x + 4] ^= e[x]
            state[x + 8] ^= e[x]

        state[4], state[5], state[6], state[7] = state[7], state[4], state[5], state[6]
        state[4:8] = [rotl32(w, 1) for w in state[4:8]]
        state[8], state[9], state[10], state[11] = state[10], state[11], state[8], state[9]
        state[8:12] = [rotl32(w, 8) for w in state[8:12]]

        state[0] ^= _RC12[r % len(_RC12)]

        for base in (0, 4, 8):
            a0, a1, a2, a3 = (state[base + 0], state[base + 1], state[base + 2], state[base + 3])
            state[base + 0] = (a0 ^ ((~a1) & a2)) & MASK32
            state[base + 1] = (a1 ^ ((~a2) & a3)) & MASK32
            state[base + 2] = (a2 ^ ((~a3) & a0)) & MASK32
            state[base + 3] = (a3 ^ ((~a0) & a1)) & MASK32

def permute_fast(state, rounds=2):
    assert len(state) == 12
    for r in range(rounds):
        p0 = [state[x] ^ state[x + 4] for x in range(4)]
        e0 = [rotl32(p0[(x - 1) & 3], 5) ^ rotl32(p0[(x - 1) & 3], 14) for x in range(4)]
        for x in range(4):
            state[x] ^= e0[x]
            state[x + 4] ^= e0[x]

        state[4], state[5], state[6], state[7] = state[7], state[4], state[5], state[6]
        state[0:4] = [rotl32(w, 1) for w in state[0:4]]
        state[4:8] = [rotl32(w, 3) for w in state[4:8]]

        state[0] ^= _RC12[r % len(_RC12)]
        state[0] &= MASK32

_IV = bytes.fromhex(
    "d4f0b8f7d2d8b6c3c0c7a4f3a4f59aa2"
    "7d8b0e6a8ab9a62d8a4c6cf2b96c3f11"
    "b7fd9d3b5f7d34a1d6ac3a0b9a8d1f2e"
)

def _init_state_words():
    return bytes_to_u32le_words(_IV)

def _absorb_and_get_prefinal_state(msg):
    rate = 24
    padded = pad10star1(msg, rate)
    st = _init_state_words()

    short = (len(msg) <= 48)
    for off in range(0, len(padded), rate):
        block = padded[off:off + rate]
        bw = bytes_to_u32le_words(block)
        for i in range(6):
            st[i] ^= bw[i]
            st[i] &= MASK32

        if short:
            permute_fast(st, rounds=2)
        else:
            permute_full(st, rounds=12)

    return st

def xoo_fast_hash_256(msg):
    st = _absorb_and_get_prefinal_state(msg)

    permute_full(st, rounds=12)

    out_bytes = 32
    out = bytearray()
    while len(out) < out_bytes:
        out.extend(u32le_words_to_bytes(st[:6]))
        if len(out) >= out_bytes:
            break
        permute_full(st, rounds=12)

    return bytes(out[:out_bytes])

if __name__ == '__main__':
    vertices = list(range(4))
    edges = [(x, y) for x in vertices for y in vertices if x != y]
    print(f'{vertices=}')
    print(f'{edges=}')
    print('Prove that you can 3-color this graph and you can have the flag!')
    for _ in range(128):
        commitments = input('Commitments: ').strip().split(':')
        commitments = [bytes.fromhex(c) for c in commitments]
        assert len(commitments) == 4
        edge = random.choice(edges)
        colors = input(f'Provide colors/nonces for {edge}: ').strip().split(':')
        colors = [bytes.fromhex(c) for c in colors]
        assert len(colors) == 2
        for vert, color in zip(edge, colors):
            assert color[0] < 3
            assert xoo_fast_hash_256(color) == commitments[vert]
        assert colors[0][0] != colors[1][0]
        print('Passed')
    print('Nice job!')
    print(os.getenv('FLAG', 'RUSEC{placeholder}'))
