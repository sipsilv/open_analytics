import pytest
from app.services.news_service import NewsService
from tests.mocks.mock_content_repositories import MockNewsRepository

class TestNewsService:
    @pytest.fixture
    def service(self):
        repo = MockNewsRepository()
        # Inject standard repo behavior
        service = NewsService(
            get_final_news_func=repo.get_news,
            get_backlog_func=lambda: {"ai_pending": 0}
        )
        service.repo = repo
        return service

    def test_fetch_news(self, service, test_logger):
        test_logger.info("UNIT: Fetch News - Starting")
        # Insert mock data
        service.repo.insert_news(None, {"title": "Test News", "source": "Reuters"})
        
        news, total = service.get_latest_news(limit=5)
        assert total == 1
        assert news[0]["title"] == "Test News"
        test_logger.info("UNIT: Fetch News - Verified news retrieval")

    def test_empty_news(self, service, test_logger):
        test_logger.info("UNIT: Empty News - Starting")
        news, total = service.get_latest_news()
        assert total == 0
        assert news == []
        test_logger.info("UNIT: Empty News - Verified empty list")
