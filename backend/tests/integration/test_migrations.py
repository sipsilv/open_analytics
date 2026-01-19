import pytest
from init_db import init_database
from app.core.config import settings
import os

def test_database_initialization(test_logger):
    """
    Test that the database initialization script runs successfully.
    This effectively tests that:
    1. Schema metadata is valid (no sqlalchemy errors)
    2. Tables can be created in the target DB (sqlite/memory)
    3. Admin user creation logic works
    """
    test_logger.info("TEST: Database Initialization - Starting")
    
    # We are using the same database handling as the app, 
    # but init_db.py uses settings.DATABASE_URL. 
    # In tests, this might differ or be mocked, but init_db 
    # generally runs against the configured environment.
    
    # Ensure we don't accidentally wipe a real DB if we run this locally against prod settings
    # (Safe here as we are in test environment/CI)
    
    test_logger.info(f"TEST: Using Database URL: {settings.DATABASE_URL}")
    
    try:
        success = init_database()
        test_logger.info(f"TEST: init_database returned: {success}")
        assert success is True
    except Exception as e:
        test_logger.error(f"TEST: Database initialization failed with error: {e}")
        pytest.fail(f"Database initialization failed: {e}")
    
    test_logger.info("TEST: Database Initialization - Complete")
