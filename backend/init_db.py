"""
Database initialization script
Creates all tables defined in SQLAlchemy models
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import Base, get_db_router
from app.core.config import settings
from app.models.user import User
from app.models.connection import Connection
from app.models.access_request import AccessRequest
from app.models.feature_request import FeatureRequest
from app.models.telegram_channel import TelegramChannel
from app.models.telegram_message import TelegramMessage

def init_database():
    """Initialize database with all tables"""
    print("=" * 60)
    print("  DATABASE INITIALIZATION")
    print("=" * 60)
    print(f"Data directory: {settings.DATA_DIR}")
    print(f"Database URL: {settings.DATABASE_URL}")
    print()
    
    # Get database router
    router = get_db_router(settings.DATA_DIR)
    auth_client = router.get_auth_db()
    
    if not auth_client:
        print("[ERROR] Failed to get auth database client")
        return False
    
    # Get SQLAlchemy engine
    engine = auth_client.engine
    
    print("[INFO] Creating all tables...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("[OK] All tables created successfully")
        
        # List created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\n[INFO] Created {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
        
        # Initialize IPO Scraper DB
        from app.services.ipo_scraper.db import ensure_schema as ensure_ipo_schema
        try:
             ensure_ipo_schema()
             print("[OK] IPO DB initialized successfully")
        except Exception as e:
             print(f"[ERROR] IPO DB initialization failed: {e}")

        print("\n" + "=" * 60)
        print("  DATABASE INITIALIZATION COMPLETE")
        print("=" * 60)
        # return True  <-- REMOVED to allow admin creation logic to run
        
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")
        import traceback
        traceback.print_exc()
        return False

    # Create initial admin user
    try:
        from sqlalchemy.orm import Session
        from app.core.auth.security import get_password_hash
        import uuid
        
        print(f"\n[INFO] Checking for admin user...")
        
        with Session(engine) as session:
            # Verify connection dialect
            dialect = session.bind.dialect.name
            print(f"[INFO] Using database dialect: {dialect}")
            
            admin_email = os.getenv("ADMIN_EMAIL")
            if not admin_email:
                print("[WARNING] ADMIN_EMAIL not set in environment. Skipping admin creation.")
                return True # Don't fail, just skip
            
            # Check if admin exists
            existing_user = session.query(User).filter(User.email == admin_email).first()
            
            if not existing_user:
                print(f"[INFO] Creating default admin user: {admin_email}")
                admin_password = os.getenv("ADMIN_PASSWORD")
                if not admin_password:
                     raise ValueError("ADMIN_PASSWORD required in environment variables")
                
                admin_username = os.getenv("ADMIN_USERNAME", "Admin User")
                
                admin_user = User(
                    user_id=str(uuid.uuid4()),
                    email=admin_email,
                    username="admin",
                    mobile="0000000000",  # Dummy mobile required by schema
                    hashed_password=get_password_hash(admin_password),
                    name=admin_username,
                    role="admin",
                    is_active=True,
                    account_status="active"
                )
                session.add(admin_user)
                session.commit()
                print("[OK] Admin user created successfully via " + dialect)
            else:
                print("[INFO] Admin user already exists")
                
    except Exception as e:
        print(f"[ERROR] Failed to create admin user: {e}")
        # Don't fail the whole init just for this
        
    return True

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
