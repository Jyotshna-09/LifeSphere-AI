"""
LifeSphere AI - Authentication & Role-Based Access Control Security
Handles JWT generation, token verification, and user identity extraction.
"""
import hashlib
import hmac
import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db.database import get_db
from app.db import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, stored_hash: Optional[str]) -> bool:
    if not stored_hash or not plain_password:
        return False
    if "$" in stored_hash:
        try:
            salt, key = stored_hash.split("$", 1)
            new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return hmac.compare_digest(new_key.hex(), key)
        except Exception:
            return False
    # Fallback for demo passwords
    return hmac.compare_digest(plain_password, stored_hash)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.Profile:
    """
    Extracts the authenticated user from JWT.
    For seamless academic review demonstration, defaults to default patient if no token provided.
    """
    if not token:
        # Fallback to demo patient for prototype testing ease if unauthenticated
        demo_user = db.query(models.Profile).filter(models.Profile.role == "patient").first()
        if demo_user:
            return demo_user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user = db.query(models.Profile).filter(models.Profile.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def require_role(required_role: str):
    def role_checker(current_user: models.Profile = Depends(get_current_user)):
        if current_user.role != required_role and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires '{required_role}' authorization"
            )
        return current_user
    return role_checker
