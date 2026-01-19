import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from app.services.auth_service import AuthService
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest
from app.core.auth.security import get_password_hash
from tests.mocks.mock_user_repository import MockUserRepository

class TestAuthService:
    @pytest.fixture
    def service(self):
        repo = MockUserRepository()
        # Seed users
        repo.create(None, User(
            email="user@example.com",
            hashed_password=get_password_hash("password123"),
            username="testuser",
            name="Test User",
            role=UserRole.USER,
            is_active=True
        ))
        repo.create(None, User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            username="superadmin",
            name="Super Admin",
            role=UserRole.SUPER_ADMIN,
            is_active=True
        ))
        repo.create(None, User(
            email="blocked@example.com",
            hashed_password=get_password_hash("password123"),
            username="blockeduser",
            name="Blocked User",
            role=UserRole.USER,
            is_active=False
        ))
        
        service = AuthService(db=MagicMock()) # DB session mocked
        service.user_repo = repo # Inject mock repo
        service._create_token_response = MagicMock(return_value={"access_token": "token"}) # Mock token gen
        return service

    @pytest.mark.asyncio
    async def test_login_success(self, service, test_logger):
        test_logger.info("UNIT: Login Success - Starting")
        req = LoginRequest(identifier="user@example.com", password="password123")
        token = await service.login(req)
        assert token is not None
        test_logger.info("UNIT: Login Success - Token generated successfully")

    @pytest.mark.asyncio
    async def test_login_invalid_password(self, service, test_logger):
        test_logger.info("UNIT: Login Invalid Password - Starting")
        req = LoginRequest(identifier="user@example.com", password="wrongpassword")
        with pytest.raises(HTTPException) as exc:
            await service.login(req)
        assert exc.value.status_code == 401
        test_logger.info("UNIT: Login Invalid Password - Verified 401 Exception")
            
    # Re-writing mocks to handle async properly if needed
    # Check if verify_password is mocked? No, it uses real hashing which is fine for unit tests.

@pytest.mark.asyncio
async def test_login_async_flow(test_logger):
    test_logger.info("UNIT: Login Async Flow - Starting")
    # Helper to prevent creating class-based async issues if pytest-asyncio not fully config
    repo = MockUserRepository()
    repo.create(None, User(
        email="async@example.com",
        hashed_password=get_password_hash("pass"),
        username="asyncuser",
        role=UserRole.USER,
        is_active=True
    ))
    
    service = AuthService(db=MagicMock())
    service.user_repo = repo
    service._create_token_response = MagicMock(return_value={"access_token": "token"})

    # 1. Success
    test_logger.info("UNIT: Testing success case...")
    await service.login(LoginRequest(identifier="async@example.com", password="pass"))
    
    # 2. Invalid Pwd
    test_logger.info("UNIT: Testing invalid password...")
    with pytest.raises(HTTPException) as exc:
        await service.login(LoginRequest(identifier="async@example.com", password="wrong"))
    assert exc.value.status_code == 401
    
    # 3. User Not Found
    test_logger.info("UNIT: Testing user not found...")
    with pytest.raises(HTTPException) as exc:
        await service.login(LoginRequest(identifier="missing@example.com", password="pass"))
    assert exc.value.status_code == 401
    test_logger.info("UNIT: Login Async Flow - All cases verified")

@pytest.mark.asyncio
async def test_login_super_admin_bypass(test_logger):
    test_logger.info("UNIT: Login Super Admin Bypass - Starting")
    repo = MockUserRepository()
    password = get_password_hash("adminpass")
    repo.create(None, User(
        email="admin@example.com",
        hashed_password=password,
        username="admin",
        role=UserRole.SUPER_ADMIN,
        is_active=False # Inactive initially
    ))
    
    db_mock = MagicMock()
    service = AuthService(db=db_mock)
    service.user_repo = repo
    service._create_token_response = MagicMock(return_value={"access_token": "admin_token"})
    
    # Super admin login should SUCCEED and Auto-Activate
    test_logger.info("UNIT: Attempting super admin login...")
    await service.login(LoginRequest(identifier="admin@example.com", password="adminpass"))
    
    user = repo.get_by_email(None, "admin@example.com")
    assert user.is_active is True # Should be activated
    assert db_mock.commit.called # Should commit changes
    test_logger.info("UNIT: Verified auto-activation and commit")

@pytest.mark.asyncio
async def test_login_blocked_user(test_logger):
    test_logger.info("UNIT: Login Blocked User - Starting")
    repo = MockUserRepository()
    repo.create(None, User(
        email="blocked@example.com",
        hashed_password=get_password_hash("pass"),
        username="blocked",
        role=UserRole.USER,
        is_active=False
    ))
    
    service = AuthService(db=MagicMock())
    service.user_repo = repo
    
    with pytest.raises(HTTPException) as exc:
        await service.login(LoginRequest(identifier="blocked@example.com", password="pass"))
    assert exc.value.status_code == 403
    test_logger.info("UNIT: Login Blocked User - Verified 403 Forbidden")
