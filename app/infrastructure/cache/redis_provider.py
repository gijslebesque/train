import json
import logging
from typing import Any, Optional, Dict
from datetime import datetime, timedelta
import redis
from . import CacheProvider, CacheEntry

logger = logging.getLogger(__name__)


class RedisCacheProvider(CacheProvider):
    """Redis cache implementation."""
    
    def __init__(self, host: str = 'localhost', port: int = 6379, db: int = 0, 
                 password: Optional[str] = None, decode_responses: bool = True):
        """
        Initialize Redis cache provider.
        
        Args:
            host: Redis host
            port: Redis port
            db: Redis database number
            password: Redis password
            decode_responses: Whether to decode responses as strings
        """
        try:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=decode_responses
            )
            # Test connection
            self.redis_client.ping()
            logger.info(f"RedisCacheProvider initialized - {host}:{port}/{db}")
        except Exception as e:
            logger.error(f"Failed to initialize Redis cache: {str(e)}")
            raise
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        try:
            cached_data = self.redis_client.get(key)
            if cached_data is None:
                logger.debug(f"Cache miss for key: {key}")
                return None
            
            # Parse the cached data
            entry_data = json.loads(cached_data)
            entry = CacheEntry.from_dict(entry_data)
            
            if entry.is_expired():
                self.redis_client.delete(key)
                logger.debug(f"Cache entry expired for key: {key}")
                return None
            
            logger.debug(f"Cache hit for key: {key}")
            return entry.value
        except Exception as e:
            logger.error(f"Failed to get cache entry for key {key}: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL."""
        try:
            entry = CacheEntry(
                value=value,
                created_at=datetime.now(),
                ttl_seconds=ttl_seconds
            )
            
            # Serialize the entry
            entry_data = json.dumps(entry.to_dict(), default=str)
            
            # Set with TTL if provided
            if ttl_seconds:
                self.redis_client.setex(key, ttl_seconds, entry_data)
            else:
                self.redis_client.set(key, entry_data)
            
            logger.debug(f"Cache set for key: {key} (TTL: {ttl_seconds}s)")
            return True
        except Exception as e:
            logger.error(f"Failed to set cache entry for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        try:
            result = self.redis_client.delete(key)
            if result:
                logger.debug(f"Cache entry deleted for key: {key}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete cache entry for key {key}: {str(e)}")
            return False
    
    def clear(self) -> bool:
        """Clear all cache entries."""
        try:
            self.redis_client.flushdb()
            logger.info("Redis cache cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear Redis cache: {str(e)}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Failed to check cache existence for key {key}: {str(e)}")
            return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            info = self.redis_client.info()
            return {
                'total_entries': info.get('db0', {}).get('keys', 0),
                'memory_usage_mb': info.get('used_memory', 0) / (1024 * 1024),
                'connected_clients': info.get('connected_clients', 0),
                'redis_version': info.get('redis_version', 'unknown'),
                'uptime_seconds': info.get('uptime_in_seconds', 0)
            }
        except Exception as e:
            logger.error(f"Failed to get Redis cache stats: {str(e)}")
            return {
                'error': str(e),
                'total_entries': 0,
                'memory_usage_mb': 0
            }
