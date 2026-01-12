#!/usr/bin/env python3

FLAG = b"RUSEC{i_suppos3_you_0utjuggl3d_me_LKNGFU389XYVGTS7ONLEU4DMK}"
ko = b"\x2c"
keys = [b"\xca\xb1", b"\xd6\xc9", b"\xaa\x07"]


flag_stage0 = [-1] * len(FLAG)

for i in range(0, len(FLAG)):
    flag_stage0[i] = FLAG[i] ^ ko[0]

print("const uint8_t f1[3][CHUNK_LEN] = {\n\t{\n\t\t", end='')

for k in range(0, 60, 20):
    for i in range(k, k + 20, 2):
        z = int(k / 20)
        print(f"0x{(flag_stage0[i] ^ keys[z][0]):2x}, ", end='')
        print(f"0x{(flag_stage0[i+1] ^ keys[z][1]):2x}", end='')
        if (i < k + 18):
            print(", ", end='')
        if (i == k + 8):
            print("\n\t\t", end='')

    print("\n\t}", end='')
    if (k < 40):
        print(",\n\t{\n\t\t", end='')

print("\n};")
