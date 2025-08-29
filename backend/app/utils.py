from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from .database import SessionLocal
from . import schemas
from fastapi import Depends, HTTPException, status
from .models import User
from fastapi.security import OAuth2PasswordBearer
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
# Xác thực token và giải mã
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # chứa: {"sub": "username", "exp": ...}
    except JWTError:
        return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    db = SessionLocal()
    user = db.query(User).filter(User.username == username).first()
    db.close()
    if user is None:
        raise credentials_exception
    return user

def num2words_vnd(number) -> str:
    """Chuyển số thành chữ tiếng Việt cho tiền VND."""
    try:
        number = int(float(number))
    except Exception:
        return "Không đồng"

    if number == 0:
        return "Không đồng"

    units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"]
    num_words = {
        0: "không", 1: "một", 2: "hai", 3: "ba", 4: "bốn",
        5: "năm", 6: "sáu", 7: "bảy", 8: "tám", 9: "chín"
    }

    def read_three_digits(n, full=False):
        hundred = n // 100
        ten = (n % 100) // 10
        unit = n % 10
        parts = []

        # Hàng trăm
        if hundred > 0:
            parts.append(num_words[hundred] + " trăm")
        elif full:
            parts.append("không trăm")

        # Hàng chục
        if ten > 1:
            parts.append(num_words[ten] + " mươi")
            if unit == 1:
                parts.append("mốt")
            elif unit == 4:
                parts.append("tư")
            elif unit == 5:
                parts.append("lăm")
            elif unit > 0:
                parts.append(num_words[unit])
        elif ten == 1:
            parts.append("mười")
            if unit == 1:
                parts.append("một")
            elif unit == 4:
                parts.append("bốn")
            elif unit == 5:
                parts.append("lăm")
            elif unit > 0:
                parts.append(num_words[unit])
        elif ten == 0 and unit > 0:
            if hundred > 0 or full:
                parts.append("linh")
            parts.append(num_words[unit])

        return " ".join(parts)

    # Tách số thành từng nhóm 3 chữ số
    num_str = str(number)
    groups = []
    while num_str:
        groups.insert(0, int(num_str[-3:]))
        num_str = num_str[:-3]

    parts = []
    for i, group in enumerate(groups):
        if group > 0:
            part = read_three_digits(group, full=(i > 0))
            unit = units[len(groups) - i - 1]
            parts.append(f"{part} {unit}".strip())
        else:
            # nhóm 0 nhưng cần đọc "không trăm..." nếu ở giữa
            if i < len(groups) - 1 and any(g > 0 for g in groups[i+1:]):
                parts.append(read_three_digits(group, full=True))

    result = " ".join(parts)
    result = result[0].upper() + result[1:] + " đồng"
    return result
