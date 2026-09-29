"""
LifeSphere AI - Authentication Endpoints
"""
import uuid
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import UserRegister, UserLogin, SwitchDemoUser, TokenResponse, UserProfileResponse
from app.security.auth import create_access_token, get_current_user, hash_password, verify_password
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    # 1. Validation of required fields
    raw_username = (req.username or "").strip()
    if not raw_username:
        if req.email and req.email.strip():
            raw_username = req.email.strip().split("@")[0]
        else:
            raise HTTPException(status_code=400, detail="Username is required")

    first_name = (req.first_name or "").strip()
    last_name = (req.last_name or "").strip()
    full_name = (req.full_name or "").strip()
    if not full_name:
        if first_name or last_name:
            full_name = f"{first_name} {last_name}".strip()
        else:
            full_name = raw_username

    if not req.password:
        raise HTTPException(status_code=400, detail="Password is required")

    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 2. Check username uniqueness
    existing_user = db.query(models.Profile).filter(
        models.Profile.username.ilike(raw_username)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists. Please choose a different username.")

    # 3. Format or validate email
    email = (req.email or "").strip()
    if not email:
        email = f"{raw_username.lower()}@lifesphere.local"
    
    existing_email = db.query(models.Profile).filter(models.Profile.email.ilike(email)).first()
    if existing_email:
        email = f"{raw_username.lower()}_{uuid.uuid4().hex[:4]}@lifesphere.local"

    # 4. Hash password with secure PBKDF2
    hashed_pwd = hash_password(req.password)

    # Generate internal Health ID: LSP-XXXXXX
    health_id = f"LSP-{uuid.uuid4().hex[:6].upper()}"
    role = (req.role or "patient").lower()

    profile = models.Profile(
        id=str(uuid.uuid4()),
        username=raw_username,
        email=email,
        password_hash=hashed_pwd,
        full_name=full_name,
        phone=req.phone,
        role=role,
        health_id=health_id,
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    db.add(profile)

    if profile.role == "patient":
        patient_details = models.Patient(
            id=profile.id,
            dob=req.dob,
            gender=req.gender or "Unspecified",
            blood_group=req.blood_group or "O+"
        )
        db.add(patient_details)
    elif profile.role == "doctor":
        doc_details = models.Doctor(
            id=profile.id,
            specialization=req.specialization or "General Medicine",
            license_number=req.license_number or f"LIC-{uuid.uuid4().hex[:6].upper()}",
            hospital_affiliation=req.hospital_affiliation or "LifeSphere Clinical Network"
        )
        db.add(doc_details)

    db.commit()
    db.refresh(profile)

    # Audit log
    AuditService.log_event(
        db=db,
        action="AUTH_REGISTER",
        resource_type="USER",
        user_id=profile.id,
        user_role=profile.role,
        resource_id=profile.id,
        details={"username": profile.username, "email": profile.email, "role": profile.role}
    )

    token = create_access_token({"sub": profile.id, "role": profile.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": profile.id,
            "username": profile.username,
            "email": profile.email,
            "full_name": profile.full_name,
            "phone": profile.phone,
            "role": profile.role,
            "health_id": profile.health_id,
            "avatar_url": profile.avatar_url
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    identifier = (req.username or req.email or "").strip()
    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email is required"
        )

    # Allow login with either username or email
    profile = db.query(models.Profile).filter(
        (models.Profile.username.ilike(identifier)) | (models.Profile.email.ilike(identifier))
    ).first()

    if not profile or not verify_password(req.password, profile.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    # Audit log
    AuditService.log_event(
        db=db,
        action="AUTH_LOGIN",
        resource_type="SESSION",
        user_id=profile.id,
        user_role=profile.role,
        resource_id=profile.id,
        details={"identifier": identifier, "username": profile.username}
    )

    token = create_access_token({"sub": profile.id, "role": profile.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": profile.id,
            "username": profile.username,
            "email": profile.email,
            "full_name": profile.full_name,
            "phone": profile.phone,
            "role": profile.role,
            "health_id": profile.health_id,
            "avatar_url": profile.avatar_url
        }
    }

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: models.Profile = Depends(get_current_user), db: Session = Depends(get_db)):
    patient_info = None
    if current_user.role == "patient" and current_user.patient_details:
        p = current_user.patient_details
        patient_info = {
            "dob": str(p.dob) if p.dob else None,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "emergency_contact_name": p.emergency_contact_name,
            "emergency_contact_phone": p.emergency_contact_phone,
            "address": p.address,
            "allergies_summary": p.allergies_summary,
            "conditions_summary": p.conditions_summary
        }

    doctor_info = None
    if current_user.role == "doctor" and current_user.doctor_details:
        d = current_user.doctor_details
        doctor_info = {
            "specialization": d.specialization,
            "license_number": d.license_number,
            "hospital_affiliation": d.hospital_affiliation,
            "consultation_fee": d.consultation_fee,
            "available_days": d.available_days
        }

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "health_id": current_user.health_id,
        "avatar_url": current_user.avatar_url,
        "patient_details": patient_info,
        "doctor_details": doctor_info
    }

@router.post("/switch-demo", response_model=TokenResponse)
def switch_demo(req: SwitchDemoUser, db: Session = Depends(get_db)):
    """
    Switch directly between demo Patient, Doctor, or Admin account.
    """
    target_role = req.role.lower()
    profile = db.query(models.Profile).filter(models.Profile.role == target_role).first()
    if not profile:
        raise HTTPException(status_code=404, detail=f"No demo user found with role: {target_role}")

    token = create_access_token({"sub": profile.id, "role": profile.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": profile.id,
            "username": profile.username,
            "email": profile.email,
            "full_name": profile.full_name,
            "phone": profile.phone,
            "role": profile.role,
            "health_id": profile.health_id,
            "avatar_url": profile.avatar_url
        }
    }
