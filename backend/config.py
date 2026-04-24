"""Application configuration — loads environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ──
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_proctoring")

# ── Auth ──
JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRE_HOURS: int = 24

# ── OpenRouter / LLM ──
OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemma-3-12b-it:free")

# ── Email (fastapi-mail) ──
MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
MAIL_FROM: str = os.getenv("MAIL_FROM", "")
MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))

# ── Frontend URL (for email links) ──
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
