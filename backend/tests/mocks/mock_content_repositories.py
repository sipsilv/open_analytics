from typing import List, Dict, Optional, Any

class MockTelegramRepository:
    def __init__(self):
        self.channels = {}
        self.listeners = {}

    def get_channel_by_telegram_id(self, connection_id: int, telegram_id: int):
        for c in self.channels.values():
            if c.connection_id == connection_id and c.channel_id == telegram_id:
                return c
        return None

    def get_channels_by_connection(self, connection_id: int):
        return [c for c in self.channels.values() if c.connection_id == connection_id]

    def create_channel(self, channel):
        self.channels[channel.channel_id] = channel
        return channel

    def get_channel_by_id(self, channel_id: int):
        for c in self.channels.values():
            if getattr(c, 'id', None) == channel_id:
                return c
        return None

    def update_channel(self, channel):
        self.channels[channel.channel_id] = channel
        return channel

    def delete_channel(self, channel):
        if channel.channel_id in self.channels:
            del self.channels[channel.channel_id]

    def get_channel_stats(self, channel_ids: List[int], table_name: str):
        return {cid: 0 for cid in channel_ids}

class MockNewsRepository:
    def __init__(self):
        self.news = []

    def get_news(self, limit=10, offset=0, search=None):
        return self.news[offset:offset+limit], len(self.news)
    
    def insert_news(self, conn, news_item):
        self.news.append(news_item)
        return True

    def get_db_connection(self):
        # Similar dummy connection pattern if needed
        class DummyConn:
            def close(self): pass
        return DummyConn()
    
