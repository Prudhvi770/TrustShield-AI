import os
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trustshield.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Analysis(Base):
    __tablename__ = "analyses"
    analysis_id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    input_text = Column(Text, nullable=False)
    input_type = Column(String(50), default="News")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    final_verdict = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    overall_risk = Column(String(50), nullable=False)
    agreement = Column(Boolean, default=True)
    evidence_status = Column(String(50), default="INSUFFICIENT")
    summary = Column(Text, nullable=True)
    
    claims = relationship("ClaimRecord", back_populates="analysis", cascade="all, delete-orphan")
    reviews = relationship("LLMReview", back_populates="analysis", cascade="all, delete-orphan")

class ClaimRecord(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(64), ForeignKey("analyses.analysis_id"))
    claim_text = Column(Text, nullable=False)
    claim_type = Column(String(100), default="Government/Financial")
    organization = Column(String(100), nullable=True)
    action = Column(String(100), nullable=True)
    amount = Column(String(100), nullable=True)
    target = Column(String(100), nullable=True)
    is_factual = Column(Boolean, default=True)
    
    analysis = relationship("Analysis", back_populates="claims")

class LLMReview(Base):
    __tablename__ = "llm_reviews"
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(64), ForeignKey("analyses.analysis_id"))
    model_name = Column(String(50), nullable=False)
    verdict = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    agreement_with_qwen = Column(Boolean, default=True)
    issues_found = Column(Text, nullable=True)
    
    analysis = relationship("Analysis", back_populates="reviews")

class Document(Base):
    __tablename__ = "documents"
    document_id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    organization = Column(String(100), nullable=False)
    date = Column(String(50), nullable=False)
    source_url = Column(String(255), nullable=True)
    file_type = Column(String(20), default="PDF")
    status = Column(String(50), default="INDEXED")
    chunk_count = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
