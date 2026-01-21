import pytest
from unittest.mock import MagicMock, patch
from app.providers.ai_enrichment_config_manager import (
    create_enrichment_config,
    get_all_enrichment_configs,
    update_enrichment_config,
    delete_enrichment_config
)

class TestAIEnrichmentConfig:
    @pytest.fixture
    def mock_duckdb(self):
        with patch("app.services.ai_enrichment_config_manager.get_ai_enrichment_conn") as mock:
            conn = MagicMock()
            mock.return_value = conn
            yield conn

    def test_get_all_configs(self, mock_duckdb, test_logger):
        test_logger.info("UNIT: Get All Enrichment Configs - Starting")
        mock_duckdb.execute.return_value.fetchall.return_value = [
            (1, 101, "gpt-4", "Prompt", True, None, None)
        ]
        configs = get_all_enrichment_configs()
        assert len(configs) == 1
        assert configs[0]["model_name"] == "gpt-4"
        test_logger.info("UNIT: Get All Enrichment Configs - Verified returned list")

    def test_create_config(self, mock_duckdb, test_logger):
        test_logger.info("UNIT: Create Enrichment Config - Starting")
        mock_duckdb.execute.return_value.fetchone.return_value = (1, 101, "gpt-4", "Prompt", True, None, None)
        config = create_enrichment_config({
            "connection_id": 101,
            "model_name": "gpt-4",
            "prompt_text": "Prompt",
            "is_active": True
        })
        assert config["config_id"] == 1
        assert config["model_name"] == "gpt-4"
        test_logger.info("UNIT: Create Enrichment Config - Verified created config object")
