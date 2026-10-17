import os
from typing import Optional

class Settings:
    APP_NAME: str = "TrustShield AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    QWEN_MODEL: str = os.getenv("QWEN_MODEL", "qwen3-8b")
    QWEN_API_KEY: Optional[str] = os.getenv("QWEN_API_KEY", None)
    QWEN_API_BASE: Optional[str] = os.getenv("QWEN_API_BASE", None)
    
    LLAMA_MODEL: str = os.getenv("LLAMA_MODEL", "llama-3.1-8b")
    LLAMA_API_KEY: Optional[str] = os.getenv("LLAMA_API_KEY", None)
    LLAMA_API_BASE: Optional[str] = os.getenv("LLAMA_API_BASE", None)
    
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustshield.db")
    CHROMA_PATH: str = os.getenv("CHROMA_PATH", "./chroma_db")
    HF_TOKEN: Optional[str] = os.getenv("HF_TOKEN", None)
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "trustshield-super-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    TOP_K_EVIDENCE: int = 5

settings = Settings()
