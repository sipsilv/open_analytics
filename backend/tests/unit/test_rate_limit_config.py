import os
import pytest
from app.core.config import Settings


def test_rate_limit_config_defaults():
    """Verify default rate limit values are set correctly"""
    # Set required fields to avoid validation errors
    os.environ["JWT_SECRET_KEY"] = "test_secret"
    os.environ["JWT_SYSTEM_SECRET_KEY"] = "test_system_secret"
    os.environ["ENCRYPTION_KEY"] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    
    # Clear any rate limit env vars to test defaults
    rate_limit_vars = [
        "RATE_LIMIT_LOGIN",
        "RATE_LIMIT_PASSWORD_RESET",
        "RATE_LIMIT_ADMIN_CREATE_USER",
        "RATE_LIMIT_ADMIN_DELETE_USER",
        "RATE_LIMIT_ADMIN_CREATE_REQUEST",
        "RATE_LIMIT_ADMIN_CREATE_AI_CONFIG"
    ]
    for var in rate_limit_vars:
        os.environ.pop(var, None)
    
    settings = Settings()
    
    # Verify defaults match what we set in config.py
    assert settings.RATE_LIMIT_LOGIN == "5/minute"
    assert settings.RATE_LIMIT_PASSWORD_RESET == "3/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_USER == "10/minute"
    assert settings.RATE_LIMIT_ADMIN_DELETE_USER == "5/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_REQUEST == "5/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_AI_CONFIG == "5/minute"


def test_rate_limit_config_from_env():
    """Verify rate limits can be overridden via environment variables"""
    # Set required fields
    os.environ["JWT_SECRET_KEY"] = "test_secret"
    os.environ["JWT_SYSTEM_SECRET_KEY"] = "test_system_secret"
    os.environ["ENCRYPTION_KEY"] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    
    # Override rate limits
    os.environ["RATE_LIMIT_LOGIN"] = "10/minute"
    os.environ["RATE_LIMIT_PASSWORD_RESET"] = "2/minute"
    os.environ["RATE_LIMIT_ADMIN_CREATE_USER"] = "20/minute"
    os.environ["RATE_LIMIT_ADMIN_DELETE_USER"] = "3/minute"
    os.environ["RATE_LIMIT_ADMIN_CREATE_REQUEST"] = "8/minute"
    os.environ["RATE_LIMIT_ADMIN_CREATE_AI_CONFIG"] = "7/minute"
    
    settings = Settings()
    
    # Verify overrides are applied
    assert settings.RATE_LIMIT_LOGIN == "10/minute"
    assert settings.RATE_LIMIT_PASSWORD_RESET == "2/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_USER == "20/minute"
    assert settings.RATE_LIMIT_ADMIN_DELETE_USER == "3/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_REQUEST == "8/minute"
    assert settings.RATE_LIMIT_ADMIN_CREATE_AI_CONFIG == "7/minute"
    
    # Cleanup
    for var in ["RATE_LIMIT_LOGIN", "RATE_LIMIT_PASSWORD_RESET", 
                "RATE_LIMIT_ADMIN_CREATE_USER", "RATE_LIMIT_ADMIN_DELETE_USER",
                "RATE_LIMIT_ADMIN_CREATE_REQUEST", "RATE_LIMIT_ADMIN_CREATE_AI_CONFIG"]:
        os.environ.pop(var, None)


def test_rate_limit_format_validation():
    """Verify rate limit format is valid for slowapi"""
    os.environ["JWT_SECRET_KEY"] = "test_secret"
    os.environ["JWT_SYSTEM_SECRET_KEY"] = "test_system_secret"
    os.environ["ENCRYPTION_KEY"] = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
    
    settings = Settings()
    
    # All rate limits should follow the "number/time_unit" format
    rate_limits = [
        settings.RATE_LIMIT_LOGIN,
        settings.RATE_LIMIT_PASSWORD_RESET,
        settings.RATE_LIMIT_ADMIN_CREATE_USER,
        settings.RATE_LIMIT_ADMIN_DELETE_USER,
        settings.RATE_LIMIT_ADMIN_CREATE_REQUEST,
        settings.RATE_LIMIT_ADMIN_CREATE_AI_CONFIG
    ]
    
    for rate_limit in rate_limits:
        # Should contain a slash
        assert "/" in rate_limit, f"Rate limit '{rate_limit}' missing '/'"
        
        # Split and verify format
        parts = rate_limit.split("/")
        assert len(parts) == 2, f"Rate limit '{rate_limit}' should have exactly 2 parts"
        
        # First part should be a number
        assert parts[0].isdigit(), f"Rate limit '{rate_limit}' count should be numeric"
        
        # Second part should be a valid time unit
        valid_units = ["second", "minute", "hour", "day"]
        assert parts[1] in valid_units, f"Rate limit '{rate_limit}' has invalid time unit"
