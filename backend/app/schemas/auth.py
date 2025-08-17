from pydantic import BaseModel
from .user import UserInfo


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserInfo
