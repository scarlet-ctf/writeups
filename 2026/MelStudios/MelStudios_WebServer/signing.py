import hmac
from hashlib import sha256

from base64 import b64encode
from os import urandom

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

class AccessToken():
    def __init__(self):
        self.key = urandom(16)
        self.iv = urandom(16)
    
    def generate_cookie(self, data):
        if type(data) != bytes:
            data = str(data).encode("latin1")

        # generate the encryptor
        encryptor = AES.new(key=self.key, mode=AES.MODE_OFB, iv=self.iv)

        # generate the signature
        sig = encryptor.encrypt(pad(data,16))[-16:].hex()
        return b64encode(data).decode("ascii") + "." + sig