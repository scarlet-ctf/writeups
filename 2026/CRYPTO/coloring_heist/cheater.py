#!/usr/bin/env python3

# Client to test that submitting a valid coloring works

from itertools import permutations
import json
from pwn import process

with open('colors.txt', 'r') as f:
    coloring = list(map(int, f))

colors = list(range(3))

for perm in permutations(colors):
    conn = process(['./chal.py'])

    conn.sendline(json.dumps({
        'option': 'guess',
        'coloring': [perm[c] for c in coloring],
    }).encode())

    resp = json.loads(conn.recvlineS())
    assert 'flag' in resp, resp

    conn.sendline(b'{"option": "exit"}')
    conn.interactive()
    conn.close()
