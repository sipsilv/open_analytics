def test_get_announcements(client, admin_token, test_logger):
    test_logger.info("TEST: Get Announcements - Starting")
    # Public or Protected? usually public or authenticated. 
    # Try public first
    response = client.get("/api/v1/announcements")
    if response.status_code == 401:
         test_logger.info("TEST: Public access failed (401), retrying with admin token...")
         response = client.get("/api/v1/announcements", headers={"Authorization": f"Bearer {admin_token}"})
    
    test_logger.info(f"TEST: Get Announcements - Status: {response.status_code}")
    assert response.status_code == 200
    # Should return list/paginated
    data = response.json()
    assert "announcements" in data or isinstance(data, list)
    test_logger.info("TEST: Get Announcements - Verified response structure")

def test_get_news(client, admin_token, test_logger):
    test_logger.info("TEST: Get News - Starting")
    response = client.get("/api/v1/news", headers={"Authorization": f"Bearer {admin_token}"})
    test_logger.info(f"TEST: Get News - Status: {response.status_code}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)  # NewsService returns a dict with news, total, etc.
    assert "news" in data or "items" in data
    test_logger.info("TEST: Get News - Verified response structure")

def test_telegram_channel_list(client, admin_token, test_logger):
    test_logger.info("TEST: Get Telegram Channels - Starting")
    response = client.get("/api/v1/telegram/channels", headers={"Authorization": f"Bearer {admin_token}"})
    test_logger.info(f"TEST: Get Telegram Channels - Status: {response.status_code}")
    assert response.status_code == 200

