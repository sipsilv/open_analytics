from fastapi import APIRouter, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.auth.permissions import get_current_user_from_token
from app.schemas.auth import LoginRequest, TokenResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse
from app.services.auth_service import AuthService
from app.core.limiter import limiter
from app.core.config import settings


router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return await service.login(login_data)

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        user = get_current_user_from_token(credentials.credentials, db)
        service = AuthService(db)
        service.logout(user)
    except:
        pass
    
    return {"message": "Logged out successfully"}

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
@limiter.limit(settings.RATE_LIMIT_PASSWORD_RESET)
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return await service.forgot_password(forgot_data)

@router.post("/reset-password", response_model=ResetPasswordResponse)
@limiter.limit(settings.RATE_LIMIT_PASSWORD_RESET)
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using OTP received via Telegram"""
    service = AuthService(db)
    return await service.reset_password(reset_data)

@router.post("/refresh")
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(credentials.credentials, db)
    service = AuthService(db)
    return service.refresh_token(user)
