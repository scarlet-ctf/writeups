The Unity game is built in IL2CPP, not Mono, making reverse engineering harder

The goal is to utilize a bunch of reverse engineering tools for Unity (for example, [this](https://github.com/Perfare/Il2CppDumper) tool)

The actual method doesn't matter, but the goal is to find the `Start()` function in the script `RUSEC`. This start function does the following:
1. Generate `key = SHA256(companyName + "\n" + productName)`
    1. `companyName` is "RUSEC CTF"
    1. `productName` is "SpaceTime"
    1. Both can be found pretty easily, they're just unity constants
1. Queries the game webserver at the `/flagtime` endpoint, to which the server returns an `IV` and `ciphertext` (which is the flag encrypted)
    1. Decrypts ciphertext using IV, key, and AES CBC
    1. Does a check to make sure it works (the "Made by RUSEC" banner)

Essentially, all you need is the key, then decryption at the `/flagtime` endpoint gives the flag
