from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import synonym
from app.core.database import Base
import uuid

class UserRole:
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)  # Unique immutable user ID
    username = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)  # Full name
    email = Column(String, unique=True, index=True, nullable=False)  # Required email
    mobile = Column(String, unique=True, index=True, nullable=False)  # Required mobile
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER, nullable=False)  # user, admin, super_admin
    full_name = synonym("name")
    is_active = Column(Boolean, default=True, nullable=False)
    account_status = Column(String, default="ACTIVE", nullable=False) # PENDING, INACTIVE, ACTIVE, SUSPENDED, DEACTIVATED
    theme_preference = Column(String, default="dark", nullable=False)  # dark, light
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_seen = Column(DateTime(timezone=True), nullable=True)
    last_active_at = Column(DateTime(timezone=True), nullable=True)  # For live status tracking
    telegram_chat_id = Column(String, nullable=True)  # Telegram Chat ID for OTP/Alerts
    two_factor_enabled = Column(Boolean, default=False, nullable=False)  # Enable 2FA via Telegram
