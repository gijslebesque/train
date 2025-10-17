from abc import ABC, abstractmethod
from typing import Any, Optional, Dict
import hashlib
import json
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CacheProvider(ABC):
    """Abstract base class for cache providers."""
    
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        pass
    
    @abstractmethod
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL."""
        pass
    
    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        pass
    
    @abstractmethod
    def clear(self) -> bool:
        """Clear all cache entries."""
        pass
    
    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        pass


class CacheEntry:
    """Represents a cache entry with metadata."""
    
    def __init__(self, value: Any, created_at: datetime, ttl_seconds: Optional[int] = None):
        self.value = value
        self.created_at = created_at
        self.ttl_seconds = ttl_seconds
        self.expires_at = created_at + timedelta(seconds=ttl_seconds) if ttl_seconds else None
    
    def is_expired(self) -> bool:
        """Check if the cache entry has expired."""
        if self.expires_at is None:
            return False
        return datetime.now() > self.expires_at
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        return {
            'value': self.value,
            'created_at': self.created_at.isoformat(),
            'ttl_seconds': self.ttl_seconds,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CacheEntry':
        """Create from dictionary."""
        created_at = datetime.fromisoformat(data['created_at'])
        expires_at = datetime.fromisoformat(data['expires_at']) if data['expires_at'] else None
        
        entry = cls(
            value=data['value'],
            created_at=created_at,
            ttl_seconds=data['ttl_seconds']
        )
        entry.expires_at = expires_at
        return entry


class InMemoryCacheProvider(CacheProvider):
    """In-memory cache implementation."""
    
    def __init__(self):
        self._cache: Dict[str, CacheEntry] = {}
        logger.info("InMemoryCacheProvider initialized")
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        if key not in self._cache:
            return None
        
        entry = self._cache[key]
        if entry.is_expired():
            del self._cache[key]
            logger.debug(f"Cache entry expired for key: {key}")
            return None
        
        logger.debug(f"Cache hit for key: {key}")
        return entry.value
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL."""
        try:
            entry = CacheEntry(
                value=value,
                created_at=datetime.now(),
                ttl_seconds=ttl_seconds
            )
            self._cache[key] = entry
            logger.debug(f"Cache set for key: {key} (TTL: {ttl_seconds}s)")
            return True
        except Exception as e:
            logger.error(f"Failed to set cache entry for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache."""
        try:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache entry deleted for key: {key}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete cache entry for key {key}: {str(e)}")
            return False
    
    def clear(self) -> bool:
        """Clear all cache entries."""
        try:
            self._cache.clear()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {str(e)}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        if key not in self._cache:
            return False
        
        entry = self._cache[key]
        if entry.is_expired():
            del self._cache[key]
            return False
        
        return True
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_entries = len(self._cache)
        expired_entries = sum(1 for entry in self._cache.values() if entry.is_expired())
        active_entries = total_entries - expired_entries
        
        return {
            'total_entries': total_entries,
            'active_entries': active_entries,
            'expired_entries': expired_entries,
            'cache_size_mb': sum(len(str(entry.value)) for entry in self._cache.values()) / (1024 * 1024)
        }


class CacheService:
    """High-level cache service with key generation and serialization."""
    
    def __init__(self, provider: CacheProvider, default_ttl_seconds: int = 3600):
        self.provider = provider
        self.default_ttl_seconds = default_ttl_seconds
        logger.info(f"CacheService initialized with provider: {type(provider).__name__}")
    
    def _generate_key(self, prefix: str, data: Any) -> str:
        """Generate a cache key from prefix and data."""
        # Create a hash of the data for consistent key generation
        data_str = json.dumps(data, sort_keys=True, default=str)
        data_hash = hashlib.md5(data_str.encode()).hexdigest()
        return f"{prefix}:{data_hash}"
    
    def get(self, prefix: str, data: Any) -> Optional[Any]:
        """Get cached value."""
        key = self._generate_key(prefix, data)
        return self.provider.get(key)
    
    def set(self, prefix: str, data: Any, value: Any, ttl_seconds: Optional[int] = None) -> bool:
        """Set cached value."""
        key = self._generate_key(prefix, data)
        ttl = ttl_seconds or self.default_ttl_seconds
        return self.provider.set(key, value, ttl)
    
    def delete(self, prefix: str, data: Any) -> bool:
        """Delete cached value."""
        key = self._generate_key(prefix, data)
        return self.provider.delete(key)
    
    def exists(self, prefix: str, data: Any) -> bool:
        """Check if cached value exists."""
        key = self._generate_key(prefix, data)
        return self.provider.exists(key)
    
    def clear(self) -> bool:
        """Clear all cache entries."""
        return self.provider.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        stats = self.provider.get_stats()
        stats['provider_type'] = type(self.provider).__name__
        stats['default_ttl_seconds'] = self.default_ttl_seconds
        return stats
