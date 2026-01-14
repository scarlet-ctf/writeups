Testing the login page, you are met with an error "Unauthorized personnel. Security configuration required.", hinting at a JWT token for the security department. The login page also shows that this is meant for the nightguard.  

The response headers to the error message shows the authentication notice as "Nightshift security tokens only" and a configuration notice as "legacy config mounted from /debug".This hints to the configuration for the token is stored in /debug/config/security.json. By accessing this path, you find a JSON containing the required payload categories. However, it seems that the JWT secret was scooped from the file at runtime. That clue means you should check for an exposed .env file, which holds the JWT secret. From there, you would put in the information gathered above and send the following payload:

```
payload = {
    "role": "nightguard",
    "department": "security",
    "shift": "night"
}

token = jwt.encode(payload, "g0ld3n_fr3ddy_w1ll_a1ways_b3_w@tch1ng_y0u", algorithm="HS256")
```

After entering the correct JWT token on the website, you would download file "myscripts.zip". A quick inspection of the file, reveals that the ZIP is actually a ton of Power Automate Scripts. 

After browsing through the scripts, you'll find a script meant for that strange yellow rabbit. Reading through it, it seems to have an API call obscured in it. An encrypted payload is read from /logs/session and the API endpoint is read from /config/settings. The payload in session.log is a hex-encoded string. To decode it, you would turn the hex string into bytes, subtract 1. 

Constructing the following curl command then gets you the flag: 
```
curl -X POST https://girlypies.ctf.rusec.club/api/run-flow -H "Content-Type: application/json" -d "{\"input\":\"t#at_purpl3_guy\"}"
```
