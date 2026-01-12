from fastapi import FastAPI, HTTPException, Depends, Response, Request
from fastapi.security import APIKeyCookie
from request_models import *

from sqlalchemy import create_engine, Column, Float, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, Session

from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

from hashlib import sha256
from signing import AccessToken

from os import urandom
from base64 import b64encode, b64decode

from string import digits

from faker import Faker
import random
random.seed(urandom(16))
faker = Faker()

# app
app = FastAPI(docs_url=None, redoc_url="/docs")

# generate database
engine = create_engine("sqlite:///database.db")
Base = declarative_base()

# table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False, unique=True)
    access_token = Column(String, nullable=False)
    purchased_flag = Column(String, nullable=True)
    admin = Column(Boolean, default=False)

    score = Column(Integer, default=0)
    bullet_cooldown = Column(Float, default=0.3)
    spawn_frequency = Column(Float, default=1.5)
    speed = Column(Integer, default=40)

# initialize
Base.metadata.create_all(engine)
db = Session(engine)

# make the admin user
admin_user = User(
    name=f"amels_gamedev_12{''.join(random.choices(digits,k=2))}",
    access_token=urandom(10).hex(),
    score=6767676767676767670,
    purchased_flag="RUSEC{trust_me_br0_im_t0tally_admin_y0ur_s3cret_is_s4fe_with_m3} (Level 3)",
    admin=True
)
db.add(admin_user)
db.commit()

# generate cookie security
cookie_scheme = APIKeyCookie(name="token")
token_lib = AccessToken()

# verify API key
def api_key(api_key = Depends(cookie_scheme)):
    # try to parse it
    try:
        # get the data
        data,sig = api_key.split(".")
        data = b64decode(data).decode("latin1") #allows for all bytes in level3

        # verify the signature matches
        if api_key != token_lib.generate_cookie(data):
            raise Exception("Tampered")
        
        # get the user
        user = db.query(User).filter_by(name=data).first()
        if user == None:
            raise Exception("User doesn't exist!")

        # return it
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# level 1 flag
@app.get("/flagtime")
def flagtime():
    # generate the symmetric key in the same exact way the unity game does it
    company_name = "RUSEC CTF"
    product_name = "SpaceTime"
    key = sha256((company_name+"\n"+product_name).encode("utf-8")).digest()

    # level 1 flag
    flag = b"RUSEC{sp4cetime_flagt1me_w3lcome_t0_th3_g4me_th1s_1s_0nly_th3_b3g1nn1ng_fr1end} (Level 1)"

    # generate an encryptor
    encryptor = AES.new(key=key, mode=AES.MODE_CBC)
    enc = b64encode(encryptor.encrypt(pad(flag, 16))).decode("ascii")
    iv = b64encode(encryptor.iv).decode("ascii")
    return {"iv": iv, "ct": enc}

# level 2 flag
# get the exact URL by going to /docs
l2_flag_loc = urandom(10).hex()
@app.get(f"/{l2_flag_loc}")
def purchase_level2_flag(user:User = Depends(api_key)):
    cost = 1337133713371337
    if user.score < cost:
        raise HTTPException(status_code=403, detail=f"Too low of a score; you need {user.score - cost} more to purchase!")

    # dont add flag if already set
    if user.purchased_flag != None:
        raise HTTPException(status_code=400, detail="You already purchased a flag")

    # give flag and set
    l2_flag = "RUSEC{w0w_1m_sur3_y0u_obt4ined_th1s_sc0re_l3gally_and_l3git} (Level 2)"
    user.purchased_flag = l2_flag
    db.commit()
    return {"detail": "Successfully purchased!"}

# get flags
@app.get("/purchased_flag")
def get_owned_flag(user:User = Depends(api_key)):
    return {"flag": user.purchased_flag}

# logging in
@app.post("/login")
def login(info: LoginRequest, response: Response):
    # avoid too long names
    if len(info.name) > 50:
        raise HTTPException(status_code=403, detail="Username too long")

    # if the user does not exist, create them with an access token
    found_user = db.query(User).filter_by(name=info.name).first()
    if not found_user:
        # deny anything relating to amels
        # this is to make level3 a bit less cheesy
        if "amels" in info.name.lower():
            raise HTTPException(status_code=403, detail="Please do not use my name (Amels), thanks :)")

        # generate access code and register user
        faker.seed_instance(urandom(10))
        token = "-".join([faker.word() for _ in range(5)])
        user = User(name=info.name, access_token=token)
        db.add(user)
        db.commit()
        return {"status": "created", "access_token": token}
    
    # the user does exist
    # if they don't exist with this access token, notify they have the wrong one
    if found_user.access_token != info.access_token:
        raise HTTPException(status_code=403, detail="Invalid login")
    
    # they user exists and our access token is valid
    # log them in
    response.set_cookie("token", token_lib.generate_cookie(info.name))
    return {"status": "success"}

# getting stats
@app.get("/stats")
def get_stats(user = Depends(api_key)):
    # get the user
    return {
        "name": user.name,
        "score": user.score,
        "bullet_cooldown": user.bullet_cooldown,
        "spawn_frequency": user.spawn_frequency,
        "speed": user.speed
    }

# update score
@app.post("/update")
def update_stats(score: ScoreUpdate, user = Depends(api_key)):
    # deny admin user
    if user.admin:
        raise HTTPException(status_code=403, detail="Admin user is locked")

    # deny high asf scores
    max_score = 10000000
    if score.score > max_score:
        raise HTTPException(status_code=400, detail=f"Hacking protection currently enabled; score can be set to (at maximum): {max_score}")

    # update their score
    # trick here is that a negative number bypasses above check
    # also make sure, despite the trick, that the admin user is still at the top
    user.score = min(abs(score.score), admin_user.score-1)
    user.bullet_cooldown = score.bullet_cooldown
    user.spawn_frequency = score.spawn_frequency
    user.speed = score.speed

    # commit changes
    db.commit()
    return {"detail": "succeeded"}

# get scores
@app.get("/scoreboard")
def scoreboard():
    ctr = 1
    top_users = [f"??"]*5
    for user in range(5):
        suffix = "th"
        match ctr:
            case 1:
                suffix = "st"
            case 2:
                suffix = "nd"
            case 3:
                suffix = "rd"
        top_users[ctr-1] = f"{ctr}{suffix} place: [HIDDEN FOR PRIVACY]" #hide scoreboard
        ctr += 1


    return {"top_users": top_users}
