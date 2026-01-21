from typing import Dict, Any, List, Optional, Tuple
from app.providers.news_ai.db import get_final_news, get_pipeline_backlog, get_system_setting, set_system_setting

class NewsService:
    def __init__(self, get_final_news_func=None, get_backlog_func=None):
        self.get_final_news_impl = get_final_news_func or get_final_news
        self.get_backlog_impl = get_backlog_func or get_pipeline_backlog
    def get_news(self, page: int = 1, page_size: int = 20, search: Optional[str] = None) -> Dict[str, Any]:
        offset = (page - 1) * page_size
        news_items, total = self.get_final_news_impl(limit=page_size, offset=offset, search=search)
        
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        return {
            "news": news_items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    def get_latest_news(self, limit: int = 20) -> Tuple[List[Dict], int]:
        res = self.get_news(page=1, page_size=limit)
        return res["news"], res["total"]

    def get_backlog(self) -> Dict[str, int]:
        return self.get_backlog_impl()

    def get_status(self) -> Dict[str, Any]:
        sync_enabled = get_system_setting('news_sync_enabled', 'true') == 'true'
        return {
            "status": "active" if sync_enabled else "disabled",
            "websocket_connected": True, 
            "database_accessible": True,
            "sync_enabled": sync_enabled
        }

    def toggle_sync(self, enabled: bool) -> Dict[str, Any]:
        set_system_setting('news_sync_enabled', enabled)
        return {"message": f"News sync {'enabled' if enabled else 'disabled'}", "sync_enabled": enabled}

def get_news_service() -> NewsService:
    return NewsService()
