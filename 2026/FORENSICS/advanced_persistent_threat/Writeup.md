From the packet capture, examining it will show that there is a malicious APT repository with IP address `172.22.0.3`. Searching for the HTTP requests related to it, it is involved in the files:
1. `cmdtest.deb`, the malicious debian package
1. `symbols.zip`
1. `authorization`

To analyze it, you can use `ar -x cmdtest.deb` to unpack the package (debian packages are `ar` archives). From here, open the `control.tar.xz` file to look at the "control" files, and a script `postinst` will be shown. It is involved with the `symbols.zip` file, executing the contents through `/bin/bash`, and gives us the password to unzip it.

Unzipping this zip file from the network traffic, we're given an obfuscated bash script. Deobfuscating it (base64 decode > gzip decode > reverse > base64 decode > manual deobfuscation), we can see that it:
1. Adds some bytes to a weird file named \_, unpacked from the debian package.
1. Unzips it with gzip
1. Executes it with the "master" parameter as "172.17.0.1:21", which is the C2 IP address.

The weird file after this is the malware, written in rust. It takes the server address as a parameter. Rust is very annoying/hellish to statically analyze, which is why I made hints about dynamic analysis and made the binary give information, like what command it received. The only thing needed is knowing the encryption algorithm is ChaCha20.

The malware has an identical nonce/key for ChaCha20, hardcoded. It also prints out the output of ChaCha20 XOR for whatever the client received from the server, executing it as a command.

If you send in a very large "command" of just nullbytes, since 0 XOR anything == anything, you can effectively then just get the whole keystream, and XOR it with the communication happening on port 21 in the pcap.

(You can also just, ChaCha20 decrypt the communications yourself if you obtain the key/nonce from static analysis)

(Or do a cheese I recently found but thought was sorta cool: just pipe the ciphertext from the wireshark capture into the binary. It'll run the commands though.)

From there, you'll see the command to get the flag. The flag is sent back to the server in base64, so just base64 decode the data and you'll solve the challenge.
