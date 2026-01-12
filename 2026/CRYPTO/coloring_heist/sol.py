#!/usr/bin/env python3

import json
from hashlib import sha256
from sage.all import vector, matrix
from pwn import process, remote
import networkx as nx

m = 13152378179379815081785672867620005957454449438286627972627743643665015781005638840736748732751002654743381407736010812439576964014824389995002529765266561
a = 159366294799379508230260405538460486080857348671716937260698454572531895324935570199591308975425134610886483656618025523387680649265527380424978907280628
c = 282546875723632189452110820393921416548791548742828675605467969601041505961545030191698478991825060426711934064746301072403984439778604015323729962763523
k = m.bit_length()
s = 128

QUERIES = 16

def interact(**kwds):
    global conn
    conn.sendline(json.dumps(kwds).encode())
    resp = json.loads(conn.recvlineS())
    if 'error' in resp: raise ValueError(resp['error'])
    return resp

def query(v1, v2):
    commits = interact(option='query')['commits']
    commits = [bytes.fromhex(com) for com in commits]
    proofs = interact(edge=[v1, v2])['proofs']
    for pr in proofs:
        pr['salt'] = bytes.fromhex(pr['salt'])
    return commits, proofs

def guess(coloring):
    return interact(option='guess', coloring=coloring)['flag']

def commit(value, salt):
    return sha256(value.to_bytes(1, 'big') + salt).digest()

def decode_salt(salt):
    return int.from_bytes(salt[:2], 'big'), int.from_bytes(salt[2:], 'big')

def affine_compose(tl, tr):
    global m
    al, cl = tl
    ar, cr = tr
    return (al * ar) % m, (al * cr + cl) % m

def affine_pow(t, p):
    out = (1, 0)
    acc = t
    while p:
        if p & 1:
            out = affine_compose(out, acc)
        acc = affine_compose(acc, acc)
        p >>= 1
    return out

G = nx.read_adjlist(
    'graph.txt',
    nodetype=int,
    create_using=nx.Graph,
)

NODES = len(G)

# conn = process(['./chal.py'])
conn = remote('coloring_heist', 5000)

alst = [0]
clst = [0]
ylst = []

edge = next(iter(G.edges))

for i in range(QUERIES):
    _, proofs = query(*edge)
    salts = [decode_salt(pr['salt']) for pr in proofs]
    salts.sort()
    for j, slt in salts:
        tj = i * NODES + j
        if len(ylst):
            ai, ci = affine_pow((a, c), tj - ylst[-1][0])
            alst.append(ai)
            clst.append(ci)
        ylst.append((tj, slt))

y = [b for _, b in ylst]

diff_bit_length = k - s
SAMPLES = len(y)

CW = 1 << diff_bit_length
EW = 1 << diff_bit_length
XW = 1

nvars = SAMPLES
neqs = SAMPLES - 1
BSZ = neqs + nvars + 1

CMAT = [[0] * neqs]
EMAT = [[0] * neqs for _ in range(nvars)]
for i in range(neqs):
    '''
    yp[i] = y[i] << diff
    yp[i + 1] + x[i + 1] = a[i + 1] * (yp[i] + x[i]) + c[i]
    yp[i + 1] + x[i + 1] = a[i + 1] * yp[i] + a[i + 1] * x[i] + c[i]
    a[i + 1] * x[i] - x[i + 1] + (a[i + 1] * yp[i] - yp[i + 1] + c[i])
    '''
    CMAT[0][i] = alst[i + 1] * (y[i] << diff_bit_length) - (y[i + 1] << diff_bit_length) + clst[i + 1]
    CMAT[0][i] %= m
    EMAT[i][i] = alst[i + 1]
    EMAT[i + 1][i] = -1

CMAT = matrix(CMAT)
EMAT = matrix(EMAT)

Bblks = [
    [EW * m * matrix.identity(neqs), matrix.zero(neqs, 1), matrix.zero(neqs, nvars)],
    [EW * CMAT, matrix([[CW]]), matrix.zero(1, nvars)],
    [EW * EMAT, matrix.zero(nvars, 1), XW * matrix.identity(nvars)],
]

B = matrix.block(Bblks)

B = B.LLL()

'''
Bdisp = matrix.block(Bblks + [
    [B[:, :neqs], B[:, neqs:neqs + 1], B[:, neqs + 1:]],
])
print(Bdisp)
exit(0)
'''

for row in B:
    rems = row[:neqs]
    if any(x for x in rems): continue
    cval = row[neqs]
    if cval == 0: continue
    assert cval % CW == 0
    mult = cval // CW
    coeffs = row[neqs + 1:]
    assert len(coeffs) == nvars
    assert all(x % XW == 0 for x in coeffs)
    coeffs /= XW
    if any(x % mult for x in coeffs): continue
    coeffs /= mult
    break
else:
    print('!!! failure !!!')
    exit(1)

recstates = [(yi << diff_bit_length) + x for x, yi in zip(coeffs, y)]

for i in range(1, SAMPLES):
    assert recstates[i] == (alst[i] * recstates[i - 1] + clst[i]) % m

commits, _ = query(*edge)

rev_commits = {com: i for i, com in enumerate(commits)}

state = int(recstates[-1])
ind = ylst[-1][0]

while (ind + 1) % NODES != 0:
    ind += 1
    state = (a * state + c) % m

coloring = [0] * NODES

for i in range(NODES):
    state = (a * state + c) % m
    salt = state >> diff_bit_length
    salt = i.to_bytes(2, 'big') + salt.to_bytes(s // 8, 'big')
    for col in range(3):
        com = commit(col, salt)
        if com in rev_commits:
            coloring[rev_commits[com]] = col
            break
    else:
        print(f'failed {i}')
        exit(0)

print(guess(coloring))
