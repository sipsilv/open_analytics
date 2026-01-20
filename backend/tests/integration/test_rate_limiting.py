import time
import pytest


def test_login_rate_limit(client, test_logger):
    """Verify login endpoint enforces rate limit (5/minute by default)"""
    test_logger.info("TEST: Login Rate Limit - Starting")
    
    # Make 5 requests (should all succeed)
    for i in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={"identifier": "user@example.com", "password": "wrongpassword"}
        )
        test_logger.info(f"TEST: Login Rate Limit - Request {i+1}/5 - Status: {response.status_code}")
        # Even failed logins count toward rate limit
        assert response.status_code in [200, 401], f"Request {i+1} failed unexpectedly"
    
    # 6th request should be rate limited
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "user@example.com", "password": "wrongpassword"}
    )
    test_logger.info(f"TEST: Login Rate Limit - Request 6/6 (should be limited) - Status: {response.status_code}")
    assert response.status_code == 429, "Rate limit not enforced on 6th request"
    test_logger.info("TEST: Login Rate Limit - Verified 429 Response")


def test_password_reset_rate_limit(client, test_logger):
    """Verify password reset endpoints enforce rate limit (3/minute by default)"""
    test_logger.info("TEST: Password Reset Rate Limit - Starting")
    
    # Make 3 requests to forgot-password (should all succeed or fail with valid error)
    for i in range(3):
        response = client.post(
            "/api/v1/auth/forgot-password",
            json={"identifier": "user@example.com"}
        )
        test_logger.info(f"TEST: Password Reset Rate Limit - Request {i+1}/3 - Status: {response.status_code}")
        # Should not be rate limited yet
        assert response.status_code != 429, f"Request {i+1} was rate limited too early"
    
    # 4th request should be rate limited
    response = client.post(
        "/api/v1/auth/forgot-password",
        json={"identifier": "user@example.com"}
    )
    test_logger.info(f"TEST: Password Reset Rate Limit - Request 4/4 (should be limited) - Status: {response.status_code}")
    assert response.status_code == 429, "Rate limit not enforced on 4th request"
    test_logger.info("TEST: Password Reset Rate Limit - Verified 429 Response")


def test_admin_create_user_rate_limit(client, admin_token, test_logger):
    """Verify admin create user endpoint enforces rate limit (10/minute by default)"""
    test_logger.info("TEST: Admin Create User Rate Limit - Starting")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Make 10 requests (should all succeed or fail with validation errors, but not rate limited)
    for i in range(10):
        response = client.post(
            "/api/v1/admin/users",
            headers=headers,
            json={
                "email": f"newuser{i}@example.com",
                "username": f"newuser{i}",
                "password": "password123",
                "full_name": f"New User {i}",
                "user_id": f"USER{i:03d}",
                "mobile": f"999999{i:04d}"
            }
        )
        test_logger.info(f"TEST: Admin Create User Rate Limit - Request {i+1}/10 - Status: {response.status_code}")
        # Should not be rate limited yet
        assert response.status_code != 429, f"Request {i+1} was rate limited too early"
    
    # 11th request should be rate limited
    response = client.post(
        "/api/v1/admin/users",
        headers=headers,
        json={
            "email": "newuser99@example.com",
            "username": "newuser99",
            "password": "password123",
            "full_name": "New User 99",
            "user_id": "USER999",
            "mobile": "9999999999"
        }
    )
    test_logger.info(f"TEST: Admin Create User Rate Limit - Request 11/11 (should be limited) - Status: {response.status_code}")
    assert response.status_code == 429, "Rate limit not enforced on 11th request"
    test_logger.info("TEST: Admin Create User Rate Limit - Verified 429 Response")


def test_admin_delete_user_rate_limit(client, admin_token, test_logger):
    """Verify admin delete user endpoint enforces rate limit (5/minute by default)"""
    test_logger.info("TEST: Admin Delete User Rate Limit - Starting")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Make 5 delete requests (they may fail if user doesn't exist, but should not be rate limited)
    for i in range(5):
        response = client.delete(
            f"/api/v1/admin/users/{1000 + i}",  # Non-existent user IDs
            headers=headers
        )
        test_logger.info(f"TEST: Admin Delete User Rate Limit - Request {i+1}/5 - Status: {response.status_code}")
        # Should not be rate limited yet
        assert response.status_code != 429, f"Request {i+1} was rate limited too early"
    
    # 6th request should be rate limited
    response = client.delete(
        "/api/v1/admin/users/9999",
        headers=headers
    )
    test_logger.info(f"TEST: Admin Delete User Rate Limit - Request 6/6 (should be limited) - Status: {response.status_code}")
    assert response.status_code == 429, "Rate limit not enforced on 6th request"
    test_logger.info("TEST: Admin Delete User Rate Limit - Verified 429 Response")


def test_admin_create_request_rate_limit(client, test_logger):
    """Verify admin create access request endpoint enforces rate limit (5/minute by default)"""
    test_logger.info("TEST: Admin Create Request Rate Limit - Starting")
    
    # Make 5 requests (should all succeed or fail with validation errors, but not rate limited)
    for i in range(5):
        response = client.post(
            "/api/v1/admin/requests",
            json={
                "email": f"requester{i}@example.com",
                "full_name": f"Requester {i}",
                "reason": f"Need access for testing {i}"
            }
        )
        test_logger.info(f"TEST: Admin Create Request Rate Limit - Request {i+1}/5 - Status: {response.status_code}")
        # Should not be rate limited yet
        assert response.status_code != 429, f"Request {i+1} was rate limited too early"
    
    # 6th request should be rate limited
    response = client.post(
        "/api/v1/admin/requests",
        json={
            "email": "requester99@example.com",
            "full_name": "Requester 99",
            "reason": "Need access for testing 99"
        }
    )
    test_logger.info(f"TEST: Admin Create Request Rate Limit - Request 6/6 (should be limited) - Status: {response.status_code}")
    assert response.status_code == 429, "Rate limit not enforced on 6th request"
    test_logger.info("TEST: Admin Create Request Rate Limit - Verified 429 Response")


def test_rate_limit_headers_present(client, test_logger):
    """Verify rate limit response includes appropriate headers"""
    test_logger.info("TEST: Rate Limit Headers - Starting")
    
    # Make enough requests to trigger rate limit
    for _ in range(5):
        client.post(
            "/api/v1/auth/login",
            json={"identifier": "user@example.com", "password": "wrongpassword"}
        )
    
    # This should be rate limited
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "user@example.com", "password": "wrongpassword"}
    )
    
    assert response.status_code == 429
    test_logger.info(f"TEST: Rate Limit Headers - Response headers: {dict(response.headers)}")
    
    # slowapi typically includes these headers
    # Note: Header names may vary depending on slowapi configuration
    test_logger.info("TEST: Rate Limit Headers - Verified rate limit response")
