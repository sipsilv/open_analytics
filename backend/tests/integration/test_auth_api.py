def test_login_success(client, test_logger):
    test_logger.info("TEST: Login Success - Starting")
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "user@example.com", "password": "user123"}
    )
    test_logger.info(f"TEST: Login Success - Status Code: {response.status_code}")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "user"
    test_logger.info("TEST: Login Success - Verified Token and Username")

def test_login_failure(client, test_logger):
    test_logger.info("TEST: Login Failure - Starting")
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "user@example.com", "password": "wrongpassword"}
    )
    test_logger.info(f"TEST: Login Failure - Status Code: {response.status_code}")
    assert response.status_code == 401
    test_logger.info("TEST: Login Failure - Verified 401 Response")

def test_get_current_user(client, user_token, test_logger):
    test_logger.info("TEST: Get Current User - Starting")
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    test_logger.info(f"TEST: Get Current User - Status Code: {response.status_code}")
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"
    test_logger.info("TEST: Get Current User - Verified Email")
