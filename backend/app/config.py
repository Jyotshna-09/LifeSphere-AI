"""
LifeSphere AI - Configuration Settings
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Storage & Models directories
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Database Configuration
# Default to a local SQLite database for instantaneous zero-config demonstration,
# or connect to PostgreSQL / Supabase if SUPABASE_DB_URL or DATABASE_URL is provided.
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BACKEND_DIR, 'lifesphere.db')}")

# Supabase Credentials (Optional for cloud storage / auth synchronization)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# LLM API Key (Optional: OpenAI, Groq, or fallback deterministic AI engine)
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# JWT Secret
SECRET_KEY = os.getenv("SECRET_KEY", "lifesphere-btech-secret-key-2026-super-secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days for demo ease
