from pydantic import BaseModel
from pydantic.types import PositiveFloat, PositiveInt

class LoginRequest(BaseModel):
    name : str
    access_token : str | None = None

class ScoreUpdate(BaseModel):
    score : int # no positive check here, allows for it to be negative for vulnerability
    bullet_cooldown : PositiveFloat
    spawn_frequency : PositiveFloat
    speed : PositiveInt