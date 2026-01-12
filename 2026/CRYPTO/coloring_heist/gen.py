# A script to generate a good graph
# Hopefully this can't be 1 shot by a cracked solver or someth
import random
from typing import List, Tuple


# ============================================================
#  Graph Container
# ============================================================


class ColoredGraph:
    def __init__(self, colors: List[int], edges: List[Tuple[int, int]]):
        self.colors = colors
        self.edges = edges


# ============================================================
#  Hard Graph Generator: Planted + Noise
# ============================================================


def generate_hard_3color_graph(
    n: int, avg_degree: float = 12.0, noise_prob: float = 0.05, seed: int | None = None
) -> ColoredGraph:
    """
    Produces a hard 3-colorable graph.

    - n: number of nodes.
    - avg_degree: expected average degree, controls density and hardness.
    - noise_prob q: probability of adding extra (still legal) edges.
    """

    if seed is not None:
        random.seed(seed)

    # Step 1: assign colors randomly but balanced
    colors = [None] * n
    buckets = [[], [], []]

    for i in range(n):
        c = random.randint(0, 2)
        colors[i] = c
        buckets[c].append(i)

    # Step 2: random edges across buckets
    edges = set()
    p = avg_degree / max(1, n - 1)

    for c1 in range(3):
        for c2 in range(c1 + 1, 3):
            A = buckets[c1]
            B = buckets[c2]

            for u in A:
                for v in B:
                    if random.random() < p:
                        if u < v:
                            edges.add((u, v))
                        else:
                            edges.add((v, u))

    # Step 3: add noise edges (still cross-bucket)
    for c1 in range(3):
        for c2 in range(c1 + 1, 3):
            A = buckets[c1]
            B = buckets[c2]

            for u in A:
                for v in B:
                    if random.random() < noise_prob:
                        if u < v:
                            edges.add((u, v))
                        else:
                            edges.add((v, u))

    edges = list(edges)
    return ColoredGraph(colors, edges)


# ============================================================
#  Printer + Sanity Checker
# ============================================================


def export_graph_checked(
    graph: ColoredGraph, colors_file: str = "colors.txt", edges_file: str = "graph.txt"
):
    """
    Writes colors and edges to files, but first performs:
      - color set check (must be 0,1,2)
      - adjacency legality check (no mono edges)
      - no self-loops
      - no duplicates
    Aborts with AssertionError on failure.
    """

    colors = graph.colors
    edges = graph.edges

    # Color sanity
    assert all(c in (0, 1, 2) for c in colors), "Invalid color detected."

    # Edge sanity
    seen = set()
    for u, v in edges:
        assert 0 <= u < len(colors), "Edge contains invalid node index."
        assert 0 <= v < len(colors), "Edge contains invalid node index."
        assert u != v, "Self-loop detected."
        assert colors[u] != colors[v], "Monochromatic edge detected."
        key = (u, v) if u < v else (v, u)
        assert key not in seen, "Duplicate edge detected."
        seen.add(key)

    # If no assertions fired, print
    with open(colors_file, "w") as fc:
        for c in colors:
            fc.write(f"{c}\n")

    with open(edges_file, "w") as fe:
        for u, v in seen:
            fe.write(f"{u} {v}\n")


# ============================================================
#  Command Line
# ============================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Hard 3-colorable graph generator.")
    parser.add_argument("n", type=int, help="Number of nodes.")
    parser.add_argument(
        "--degree", type=float, default=12.0, help="Expected average degree."
    )
    parser.add_argument("--noise", type=float, default=0.05, help="Noise probability.")
    parser.add_argument("--seed", type=int, default=None, help="Random seed.")
    parser.add_argument("--colors", default="colors.txt")
    parser.add_argument("--graph", default="graph.txt")

    args = parser.parse_args()

    G = generate_hard_3color_graph(
        args.n, avg_degree=args.degree, noise_prob=args.noise, seed=args.seed
    )

    export_graph_checked(G, colors_file=args.colors, edges_file=args.graph)

    print("Graph generated successfully.")
