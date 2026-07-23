from datetime import datetime, timedelta
from typing import Optional, Union
from fastapi import HTTPException, Depends, status, Security
from fastapi.security import OAuth2PasswordBearer, APIKeyHeader
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
import secrets
from ..db import get_db
from ..models.users import User, APIKey, RoleEnum
from ..schemas.users import TokenData
from ..config import get_settings

SECRET_KEY = get_settings().secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_api_key() -> str:
    return secrets.token_urlsafe(32)

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, username: str, password: str) -> Union[User, bool]:
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def get_current_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Ungültige Authentifizierung",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_user_from_api_key(
        api_key: Optional[str] = Security(api_key_header),
        db: Session = Depends(get_db)
) -> Optional[dict]:
    if not api_key:
        return None

    key_obj = db.query(APIKey).filter(
        APIKey.key == api_key,
        APIKey.is_active.is_(True)
    ).first()

    if not key_obj:
        return None

    if key_obj.expires_at and key_obj.expires_at < datetime.utcnow():
        return None

    return {"role": key_obj.role, "auth_type": "api_key"}

async def get_current_user(
        token_user: Optional[User] = Depends(get_current_user_from_token),
        api_key_user: Optional[User] = Depends(get_user_from_api_key),
) -> Union[User, dict]:
    # Priorisiere Token-Auth, falls vorhanden
    if token_user:
        if not token_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return token_user

    # Fallback auf API-Key
    if api_key_user:
        return api_key_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Nicht authentifiziert"
    )

def require_role(required_role: RoleEnum):
    """Decorator-Funktion für Rollenprüfung"""
    async def role_checker(current_user: Union[User, dict] = Depends(get_current_user)):
        if isinstance(current_user, User):
            user_role = current_user.role
        else:
            user_role = current_user["role"]

        # WRITE-Rolle hat auch READ-Rechte
        if required_role == RoleEnum.READ and user_role in [RoleEnum.READ, RoleEnum.WRITE]:
            return current_user
        elif required_role == RoleEnum.WRITE and user_role == RoleEnum.WRITE:
            return current_user
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unzureichnede Berechtigungen"
            )

    return role_checker