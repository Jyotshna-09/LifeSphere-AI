"""
LifeSphere AI - Main FastAPI Application
Academic Title: LifeSphere AI: A Unified Lifelong Digital Health Ecosystem with Explainable AI
Tagline: Your Lifelong Health Companion
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import UPLOADS_DIR
from app.db.database import Base, engine
from app.db.seed_demo import seed_database
from app.api.v1 import (
    auth, records, documents, timeline, trends, ai, ml, consent, doctor, safety, audit, notifications, admin
)

# Initialize database schema and demonstration data
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="LifeSphere AI API",
    description="A Unified Lifelong Digital Health Ecosystem with Explainable AI and Clinical Decision Support.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount private uploads directory for preview
if os.path.exists(UPLOADS_DIR):
    app.mount("/static/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include API v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(records.router, prefix=api_v1_prefix)
app.include_router(documents.router, prefix=api_v1_prefix)
app.include_router(timeline.router, prefix=api_v1_prefix)
app.include_router(trends.router, prefix=api_v1_prefix)
app.include_router(ai.router, prefix=api_v1_prefix)
app.include_router(ml.router, prefix=api_v1_prefix)
app.include_router(consent.router, prefix=api_v1_prefix)
app.include_router(doctor.router, prefix=api_v1_prefix)
app.include_router(safety.router, prefix=api_v1_prefix)
app.include_router(audit.router, prefix=api_v1_prefix)
app.include_router(notifications.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)

@app.get("/")
def root():
    return {
        "project": "LifeSphere AI",
        "academic_title": "LifeSphere AI: A Unified Lifelong Digital Health Ecosystem with Explainable AI",
        "tagline": "Your Lifelong Health Companion",
        "status": "Operational",
        "api_docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/v1/health")
def health():
    return {"status": "healthy", "service": "LifeSphere AI Backend", "version": "1.0.0"}
