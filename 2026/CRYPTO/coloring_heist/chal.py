#!/usr/local/bin/python

from itertools import permutations
import random
import os
from hashlib import sha256
import json

FLAG = os.environ.get('FLAG', 'RUSEC{test_flag}')

class SaltGen:
    def __init__(self, nodect, seed=None):
        self.nodect = nodect
        self.m = 13152378179379815081785672867620005957454449438286627972627743643665015781005638840736748732751002654743381407736010812439576964014824389995002529765266561
        self.a = 159366294799379508230260405538460486080857348671716937260698454572531895324935570199591308975425134610886483656618025523387680649265527380424978907280628
        self.c = 282546875723632189452110820393921416548791548742828675605467969601041505961545030191698478991825060426711934064746301072403984439778604015323729962763523
        self.k = self.m.bit_length()
        self.s = 128
        if seed is None: seed = os.urandom(16)
        if isinstance(seed, bytes): seed = int.from_bytes(seed, 'big')
        self.state = seed % self.m

    def one_salt(self):
        self.state = (self.a * self.state + self.c) % self.m
        return self.state >> (self.k - self.s)

    def __next__(self):
        out = [i.to_bytes(2, 'big') + self.one_salt().to_bytes(self.s // 8, 'big') for i in range(self.nodect)]
        random.shuffle(out)
        return out

def commit(value, salt):
    return sha256(value.to_bytes(1, 'big') + salt).digest()

edges = set()
NODES = 0
for u, v in (map(int, line.split()) for line in open("graph.txt")):
    edges |= {(u, v), (v, u)}
    NODES = max(NODES, u, v)
NODES += 1

with open('colors.txt', 'r') as f:
    coloring = list(map(int, f))

colors = list(range(3))
salter = SaltGen(NODES)

def handler(req):
    global colors, coloring, salter
    match req.get('option', '').lower():
        case 'query':
            salts = next(salter)
            random.shuffle(colors)
            perm_coloring = [colors[c] for c in coloring]
            commits = [commit(c, s) for c, s in zip(perm_coloring, salts)]
            print(json.dumps({
                "commits": [c.hex() for c in commits],
            }))
            query = json.loads(input())
            try:
                node1, node2 = query['edge']
                assert((node1, node2) in edges)
            except (KeyError, ValueError, AssertionError):
                return {
                    'error': 'invalid query',
                }
            return {
                'proofs': [
                    {
                        'color': perm_coloring[node1],
                        'salt': salts[node1].hex(),
                    },
                    {
                        'color': perm_coloring[node2],
                        'salt': salts[node2].hex(),
                    },
                ],
            }
        case 'guess':
            try:
                guess_coloring = req['coloring']
                assert len(guess_coloring) == NODES
                assert all(c in colors for c in guess_coloring)
            except (KeyError, ValueError, AssertionError):
                return {
                    'error': 'invalid guess',
                }
            for perm in permutations(colors):
                if all(a == perm[b] for a, b in zip(coloring, guess_coloring)):
                    return {
                        'flag': FLAG,
                    }
            return {
                'error': 'incorrect guess',
            }
        case 'exit':
            exit(0)
        case _:
            return {
                'error': 'invalid option',
            }

if __name__ == '__main__':
    while 1:
        print(json.dumps(handler(json.loads(input()))))
