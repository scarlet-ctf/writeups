#!/usr/bin/env python3

import os
from functools import lru_cache
from typing import List, Optional, Tuple
try:
    from tqdm import trange
except (ModuleNotFoundError, ImportError):
    trange = range

from chal import _absorb_and_get_prefinal_state, u32le_words_to_bytes, set_bit_in_bytes, xor_bytes, xoo_fast_hash_256

# -----------------------------
# GF(2) linear solver
# -----------------------------

def solve_gf2_system(equations: List[int], rhs: List[int], nvars: int) -> Optional[int]:
    """
    Solve M x = b over GF(2).
    - equations: list of bitmasks (length nvars bits) for each row
    - rhs: list of {0,1}
    Returns one solution as an int bitvector (nvars bits), or None if inconsistent.
    Chooses all free variables = 0.
    """
    assert len(equations) == len(rhs)
    rows = [(equations[i], rhs[i]) for i in range(len(equations))]

    pivot_row_for_col = [-1] * nvars
    row_i = 0

    # Forward elimination with full reduction (RREF-style)
    for col in range(nvars):
        # Find a pivot row at or below row_i with bit col set
        pivot = None
        for r in range(row_i, len(rows)):
            if (rows[r][0] >> col) & 1:
                pivot = r
                break
        if pivot is None:
            continue

        # Swap into position
        rows[row_i], rows[pivot] = rows[pivot], rows[row_i]
        pivot_mask, pivot_rhs = rows[row_i]

        # Eliminate this column from all other rows
        for r in range(len(rows)):
            if r != row_i and ((rows[r][0] >> col) & 1):
                rows[r] = (rows[r][0] ^ pivot_mask, rows[r][1] ^ pivot_rhs)

        pivot_row_for_col[col] = row_i
        row_i += 1
        if row_i == len(rows):
            break

    # Check for inconsistency: 0 = 1
    for mask, b in rows:
        if mask == 0 and b == 1:
            return None

    # Construct solution with all free vars = 0
    x = 0
    for col in range(nvars):
        pr = pivot_row_for_col[col]
        if pr == -1:
            continue
        mask, b = rows[pr]
        # In RREF, this row's pivot col is 1 and other pivot cols are 0,
        # so with free vars = 0, pivot var = b.
        if b & 1:
            x |= (1 << col)

    return x

# -----------------------------
# Collision attack
# -----------------------------

@lru_cache(maxsize=4)
def _build_linear_model_for_len(msg_len: int) -> Tuple[List[int], bytes]:
    """
    Build a linear model of the *pre-finalization state slice* for short messages:

    We model only the first 8 words (256 bits) of the pre-finalization state.
    In the broken fast path, the last 4 words are untouched and constant, so matching
    the first 8 words implies the full state matches.

    Returns:
      - A_rows: length 256 list; A_rows[j] is an int bitmask over nvars=8*msg_len input bits.
      - base_state_bytes: 32 bytes (first 8 words) for the all-zero message of this length.
    """
    assert msg_len <= 48, "model only built for short-message fast path"
    nvars = 8 * msg_len

    zero_msg = b"\x00" * msg_len
    base_state = _absorb_and_get_prefinal_state(zero_msg)
    base_slice = u32le_words_to_bytes(base_state[:8])  # 32 bytes = 256 bits

    A_rows = [0] * 256

    # For each input bit i, flip it and see which output bits change.
    for i in range(nvars):
        m = bytearray(zero_msg)
        set_bit_in_bytes(m, i)
        st = _absorb_and_get_prefinal_state(bytes(m))
        sl = u32le_words_to_bytes(st[:8])
        diff = xor_bytes(sl, base_slice)

        diff_int = int.from_bytes(diff, "little")
        # Fill A rows: if output bit j is 1, then row j includes variable i.
        # Output bit indexing: little-endian int, LSB is bit 0.
        for j in range(256):
            if (diff_int >> j) & 1:
                A_rows[j] |= (1 << i)

    return A_rows, base_slice


def _bit_constraints_for_byte(byte_index: int, byte_value: int, msg_len: int) -> Tuple[List[int], List[int]]:
    """
    Constrain the 8 bits (LSB-first) at byte_index to match byte_value.
    Returns (equations, rhs).
    """
    assert 0 <= byte_index < msg_len
    eqs: List[int] = []
    rhs: List[int] = []
    for b in range(8):
        var_i = byte_index * 8 + b
        eqs.append(1 << var_i)
        rhs.append((byte_value >> b) & 1)
    return eqs, rhs


def find_collision_with_chosen_boundary_byte(
    choose: str,                # "first" or "last"
    byte_a: int,
    byte_b: int,
    msg_len: int = 48,
) -> Tuple[bytes, bytes]:
    """
    Return (m1, m2) of length msg_len such that:
      - xoo_fast_hash_256(m1) == xoo_fast_hash_256(m2)
      - m1 != m2
      - If choose == "first": m1[0] == byte_a and m2[0] == byte_b
      - If choose == "last":  m1[-1] == byte_a and m2[-1] == byte_b

    Works by finding a delta in the kernel of the linear pre-finalization state slice.
    """
    if choose not in ("first", "last"):
        raise ValueError("choose must be 'first' or 'last'")
    if not (0 <= byte_a <= 255 and 0 <= byte_b <= 255):
        raise ValueError("byte_a/byte_b must be in 0..255")
    if msg_len > 48:
        raise ValueError("msg_len must be <= 48 for the intended fast-path collision")
    if msg_len <= 0:
        raise ValueError("msg_len must be positive")

    nvars = 8 * msg_len
    A_rows, _ = _build_linear_model_for_len(msg_len)

    # Build linear system:
    #   A * delta = 0   (256 equations)
    equations = A_rows.copy()
    rhs = [0] * 256

    # Add constraints on the delta byte at chosen position:
    # We want m2 = m1 XOR delta; to get m1[pos]=byte_a and m2[pos]=byte_b,
    # we require delta[pos] = byte_a XOR byte_b.
    pos = 0 if choose == "first" else (msg_len - 1)
    delta_byte = byte_a ^ byte_b

    ceqs, crhs = _bit_constraints_for_byte(pos, delta_byte, msg_len)
    equations.extend(ceqs)
    rhs.extend(crhs)

    # Solve for one delta
    delta_bits = solve_gf2_system(equations, rhs, nvars)

    # If delta_bits comes back as 0 (possible when delta_byte=0), force a nonzero bit elsewhere.
    if delta_bits is None or delta_bits == 0:
        # Try to force some other bit to 1 (not in the constrained byte).
        forced = False
        for k in range(nvars):
            if (k // 8) == pos:
                continue
            # Add equation x_k = 1
            equations2 = equations + [(1 << k)]
            rhs2 = rhs + [1]
            sol = solve_gf2_system(equations2, rhs2, nvars)
            if sol is not None and sol != 0:
                delta_bits = sol
                forced = True
                break
        if not forced:
            raise RuntimeError("Failed to find a nonzero delta satisfying constraints; try a different msg_len.")

    # Convert delta_bits to bytes
    delta = int(delta_bits).to_bytes(msg_len, "little")

    # Choose a random base message m1 that satisfies the boundary byte.
    m1 = bytearray(os.urandom(msg_len))
    m1[pos] = byte_a
    m2 = bytearray(x ^ y for x, y in zip(m1, delta))
    # Ensure m2 has the desired boundary byte (should by construction).
    assert m2[pos] == byte_b

    # Ensure distinct
    if bytes(m1) == bytes(m2):
        # Extremely unlikely unless delta==0, which we guarded against.
        raise RuntimeError("Unexpected identical messages; delta was zero?")

    return bytes(m1), bytes(m2)

if __name__ == '__main__':
    from pwn import remote

    col1, col2 = find_collision_with_chosen_boundary_byte('first', 0, 1)
    assert xoo_fast_hash_256(col1) == xoo_fast_hash_256(col2)
    assert col1 != col2
    assert col1[0] == 0
    assert col2[0] == 1

    hsh = xoo_fast_hash_256(col1)

    #io = process('./chal.py')
    io = remote('localhost', 5000)

    for _ in trange(128):
        io.sendlineafter(b'Commitments: ', ':'.join([hsh.hex()] * 4).encode())
        io.sendlineafter(b': ', f'{col1.hex()}:{col2.hex()}'.encode())

    io.interactive()
