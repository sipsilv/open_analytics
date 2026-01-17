from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.user_repository import UserRepository

class MockUserRepository(UserRepository):
    def __init__(self):
        self.users = {}
        self.next_id = 1

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        return self.users.get(user_id)

    def create(self, db: Session, user: User) -> User:
        if not hasattr(user, 'id') or user.id is None:
            user.id = self.next_id
            self.next_id += 1
        self.users[user.id] = user
        return user

    def update(self, db: Session, user: User) -> User:
        self.users[user.id] = user
        return user

    def delete(self, db: Session, user: User) -> None:
        if user.id in self.users:
            del self.users[user.id]

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return list(self.users.values())[skip : skip + limit]

    def count(self, db: Session) -> int:
        return len(self.users)
