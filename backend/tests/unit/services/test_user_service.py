import pytest
from app.services.user_service import UserService
from app.models.user import User, UserRole
from app.core.auth.security import get_password_hash
from tests.mocks.mock_user_repository import MockUserRepository

class TestUserService:
    @pytest.fixture
    def service(self):
        repo = MockUserRepository()
        # Pre-seed a super admin for permissions logic if needed
        repo.create(None, User(
            email="admin@example.com",
            username="admin",
            mobile="0000000000",
            hashed_password=get_password_hash("admin123"),
            name="Super Admin",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
            user_id="admin123"
        ))
        return UserService(db=None, user_repo=repo)

    @pytest.mark.asyncio
    async def test_create_user(self, service):
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123", # Service handles hashing
            "full_name": "Test User",
            "is_active": True,
            "role": UserRole.USER
        }
        
        user = await service.create_user(user_data)
        
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.id is not None
        # Ensure password was hashed
        assert user.hashed_password != "password123"

    @pytest.mark.asyncio
    async def test_create_user_duplicate_email(self, service):
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "password": "password123",
            "full_name": "Test User",
            "is_active": True,
            "role": UserRole.USER
        }
        await service.create_user(user_data)
        
        # Expect error on duplicate
        with pytest.raises(Exception) as exc:
            await service.create_user(user_data)
        assert "Email already registered" in str(exc.value)

    @pytest.mark.asyncio
    async def test_update_user(self, service):
        # Create user first
        user = await service.create_user({
            "email": "update@example.com",
            "username": "updateuser",
            "password": "pw",
            "full_name": "Original Name",
            "role": UserRole.USER
        })
        
        # Update
        updated = await service.update_user(user.id, {"full_name": "New Name"})
        
        assert updated.full_name == "New Name"
        assert updated.email == "update@example.com"

    @pytest.mark.asyncio
    async def test_get_user_by_email(self, service):
        await service.create_user({
            "email": "findme@example.com",
            "username": "findmeuser",
            "password": "pw",
            "full_name": "Find Me",
            "role": UserRole.USER
        })
        
        user = await service.get_user_by_email("findme@example.com")
        assert user is not None
        assert user.email == "findme@example.com"
        
        missing = await service.get_user_by_email("missing@example.com")
        assert missing is None
