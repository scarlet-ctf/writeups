from requests import session, get
from os import urandom
from base64 import b64encode
from Crypto.Util.Padding import pad
from string import digits

# xor function
xor = lambda a,b: bytes([x^y for x,y in zip(a,b)])

# url of the website
url = "http://localhost"

# try to login, get the signature
def get_signature(uname):
	# login
	s = session()
	token = s.post(f"{url}/login", json={"name": uname}).json()["access_token"]
	res = s.post(f"{url}/login", json={"name": uname, "access_token": token}).json()
	assert(res["status"] == "success")

	# return the signature
	# remove trailing quotation marks
	return bytes.fromhex(s.cookies["token"].split(".")[1].replace("\"",""))

# it uses OFB, which is essentially just AES as a keystream
# we only need to worry about the second (last) block
# first, create an account with some known plaintext (remove 1 byte for padding)
known_pt = urandom(16).hex()[:31]
sig = get_signature(known_pt)

# XOR the signature (ciphertext_2) with the second plaintext block to get ENC(ct1)
# notice how we add the padding byte
enc_ct1 = xor(sig, known_pt[16:].encode("ascii")+b"\x01")

# now begin the bruteforce..
for d1 in digits:
	for d2 in digits:
		# XOR it with target account name (the second block) to get the valid signature
		sig = xor(enc_ct1, pad((d1+d2).encode("ascii"), 16)).hex()

		# create the cookie, then send
		acc_name = "amels_gamedev_12" + d1 + d2
		cookie = b64encode(acc_name.encode("ascii")).decode("ascii") + "." + sig
		dat = get(f"{url}/purchased_flag", cookies={"token": cookie}).json()

		# is the flag in it? if so, we got the right account name
		if "RUSEC{" in str(dat):
			print(dat["flag"])
			print(acc_name)
			exit()