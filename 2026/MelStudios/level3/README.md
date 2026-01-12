The site uses the procedure for `CBC-MAC`, except using `OFB` mode instead of `CBC`

`AES-OFB` is essentially just a keystream version of AES, view more about different types of AES modes [here](https://www.geeksforgeeks.org/ethical-hacking/block-cipher-modes-of-operation/)

The solution is as follows for actually generating a valid signature:
1. Generate a valid signature for some two-block plaintext we know
1. The signature is the very last ciphertext
1. Given the target account name from the description is 18 bytes (2 blocks), and knowing the encryption diagram for `AES-OFB`, we essentially have:
	* `KEY_ENCRYPT(KEY_ENCRYPT(IV)) XOR PT2 == CT2 == SIG`
1. As long as our "user" has their signature with `KEY_ENCRYPT(KEY_ENCRYPT(IV))`, we can essentially take the signature generated for us, `XOR` with the second block of our known plaintext (with PKCS#7 padding factored in, of course), then `XOR` with the second block of the target plaintext
1. Voila, valid signature

Now, of course, there's the issue of the 2 numbers the description didn't include. This is only `10**2 == 100` possibilities to bruteforce.