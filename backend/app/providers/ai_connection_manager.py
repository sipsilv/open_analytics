import json
import logging
from app.core.database import SessionLocal
from app.repositories.connection_repository import ConnectionRepository
from app.core.auth.security import decrypt_data
from .ai_adapter import get_adapter, AIAdapter

logger = logging.getLogger(__name__)

def get_ai_adapter_for_connection(connection_id: int) -> AIAdapter:
    """Get an AI adapter for a given connection ID."""
    db = SessionLocal()
    try:
        repo = ConnectionRepository(db)
        conn = repo.get_by_id(connection_id)
        if not conn:
            logger.error(f"Connection {connection_id} not found")
            return None
        
        try:
            creds_json = decrypt_data(conn.credentials)
            creds = json.loads(creds_json)
        except Exception as e:
            logger.error(f"Failed to decrypt credentials for connection {connection_id}: {e}")
            return None
            
        return get_adapter(
            provider=conn.provider,
            api_key=creds.get("api_key") or creds.get("bot_token"),
            base_url=creds.get("base_url"),
            model=creds.get("model_name"),
            timeout=creds.get("timeout_seconds", 120)
        )
    finally:
        db.close()
