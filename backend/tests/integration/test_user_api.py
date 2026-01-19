def test_update_user_me(client, user_token, test_logger):
    test_logger.info("TEST: Update User Me - Starting")
    # Update Theme
    response = client.put(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"theme_preference": "light"}
    )
    test_logger.info(f"TEST: Update User - Status: {response.status_code}")
    assert response.status_code == 200
    assert response.json()["theme_preference"] == "light"

    # Verify Persistence
    test_logger.info("TEST: Verifying persistence...")
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.json()["theme_preference"] == "light"
    test_logger.info("TEST: Update User Me - Verified 'light' theme persistence")

# TODO add admin user management tests in test_admin_api
