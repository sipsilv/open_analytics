def test_screener_status(client, admin_token, test_logger):
    test_logger.info("TEST: Get Screener Status - Starting")
    response = client.get(
        "/api/v1/admin/screener/status",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    test_logger.info(f"TEST: Get Screener Status - Status: {response.status_code}")
    assert response.status_code == 200
    assert "is_running" in response.json()
    test_logger.info("TEST: Get Screener Status - Verified 'is_running' field")

def test_get_news_public(client, test_logger):
    test_logger.info("TEST: Get News (Public) - Starting")
    # News might be public
    response = client.get("/api/v1/news")
    # If auth required:
    if response.status_code == 401:
        test_logger.info("TEST: News requires auth (401) - Skipping public check")
        pass # Expected if protected
    else:
        test_logger.info(f"TEST: Get News (Public) - Status: {response.status_code}")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        test_logger.info("TEST: Get News (Public) - Verified list response")

def test_get_symbols_admin(client, admin_token, test_logger):
    test_logger.info("TEST: Get Symbols (Admin) - Starting")
    response = client.get(
        "/api/v1/admin/symbols",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    test_logger.info(f"TEST: Get Symbols (Admin) - Status: {response.status_code}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "items" in data
    assert isinstance(data["items"], list)
    test_logger.info(f"TEST: Get Symbols (Admin) - Verified {len(data['items'])} items")
