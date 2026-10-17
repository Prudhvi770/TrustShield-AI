import datetime
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from config import settings
from models.database import User, SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def seed_demo_users(db: Session):
    analyst = db.query(User).filter(User.email == "analyst@trustshield.ai").first()
    if not analyst:
        demo_analyst = User(
            email="analyst@trustshield.ai",
            password_hash=hash_password("trustshield123"),
            full_name="Senior Verification Analyst",
            role="analyst"
        )
        db.add(demo_analyst)
    
    auditor = db.query(User).filter(User.email == "auditor@trustshield.ai").first()
    if not auditor:
        demo_auditor = User(
            email="auditor@trustshield.ai",
            password_hash=hash_password("audit2026"),
            full_name="Risk & Compliance Auditor",
            role="auditor"
        )
        db.add(demo_auditor)
    db.commit()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except Exception:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user
