# How to run solutoin

```
docker run -it sagemath/sagemath:develop bash -v `pwd`:`pwd` -w `pwd`

sudo apt update && sudo apt install sagemath

(install any lingering python deps in script)

./sol.py
```

## Infra issues

```
https://github.com/google/nsjail/issues/236 for ubuntu 24.04
```

# High level explanation of solution

So the way the algorithm works, is, every time we query an edge, we generate a sequence of salts, shuffle the colors, and publish a commit for all the colors, and then the salt + color for the two edges.

But on a query, we also reveal to the user, commit(i) = sha256(salt(i), color(i)).

So for a single node, we know (color(i), salt(i), commit(i)).

There also is another aspect to this: If you know salt(i) and commit(i), it's easy to recover color(i) under the assumption that sha256 'never' collides: just brute over all color(i)'s, because the domain is small.

## Solution

However, this alone isn't enough, because every new query, we get a new set of salts, and the colors are shuffled, so each query is effectively "independent" in some sense.

However, the idea is that because the commits were generated via a PRNG, we effectively have a starting seed starting from some index (i). Therefore, we have all of the salts in the range salt[i:n].

However, it's not as simple as just querying node 1, because the salt sequence is shuffled. We know the salts are dependent in _some_ order, but not what. So we can recover, for that specific instance, the suffix of salts.

_Furthermore_, for this version of the problem, you can't actually simulate the PRNG directly forward, because the internal observable state is truncated every time you generate a seed.

# TODO: Have contron explain this solution

(some lattice attack idk)
