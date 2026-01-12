# apparently "int" in the compiler is restricted to a byte, whatever

flag = b"RUSEC{g0d_im_s0_s0rry_for_th1s_p4in}"

xor = lambda a,b: bytes([x^y for x,y in zip(a,b)])
flag = xor(flag, b"ekpSZQqLHHu9OS9uhsrQ9GALcGsWam49Dhqh")

d = b"ymj9VFujlwhC7M1Y2KBnubLFBGWRtPN2wr6x"
d1 = b"6sMdw5DbVgYx5I6H0N4XVL04rPKEtzyogfuY"
d = xor(d, d1)

y = list(b"TiL2ZCKYjBo0KyzPeyV3aXSv8fFNUKiFpxhC")
y1 = b"ufRNlIUO2BBhxh6P9auALbqPB6wiIGUWwdQF"
flag = list(flag)
for i,c in enumerate(y):
	flag[i] ^= (y[i]^y1[i])&d[i]

print(flag)

# proof rev works
for i,c in enumerate(flag):
	flag[i] ^= (y[i]^y1[i])&d[i]

flag = xor(flag, b"ekpSZQqLHHu9OS9uhsrQ9GALcGsWam49Dhqh")
print(bytes(flag))