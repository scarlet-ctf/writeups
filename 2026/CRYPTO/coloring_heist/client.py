#!/usr/bin/env python3

# Client to test intended functionality

import random
import json
from hashlib import sha256
from pwn import process
from tqdm import trange
import networkx as nx

TESTS = 128

def commit(value, salt):
    return sha256(value.to_bytes(1, 'big') + salt).digest()

def query(v1, v2):
    global conn
    conn.sendline(b'{"option": "query"}')
    commits = json.loads(conn.recvlineS())['commits']
    com1 = bytes.fromhex(commits[v1])
    com2 = bytes.fromhex(commits[v2])
    conn.sendline(json.dumps({'edge': [v1, v2]}).encode())
    proof1, proof2 = json.loads(conn.recvlineS())['proofs']
    c1 = proof1['color']
    c2 = proof2['color']
    assert c1 != c2
    assert 0 <= c1 < 3 and 0 <= c2 < 3
    s1 = bytes.fromhex(proof1['salt'])
    s2 = bytes.fromhex(proof2['salt'])
    assert commit(c1, s1) == com1
    assert commit(c2, s2) == com2

conn = process(['./chal.py'])

G = nx.read_adjlist(
    'graph.txt',
    nodetype=int,
    create_using=nx.Graph,
)

edges = list(G.edges)

for _ in trange(TESTS):
    edge = random.choice(edges)
    query(*edge)

conn.sendline(b'{"option": "exit"}')
conn.interactive()
