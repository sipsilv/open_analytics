"""Rate limiter instance for the application.

This module provides a centralized rate limiter instance to avoid circular imports.
The limiter is configured with a default limit and uses the client's IP address as the key.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Rate Limiter setup
# Default limit: 200 requests per minute per IP address
# Individual endpoints can override this with their own @limiter.limit() decorators
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])
