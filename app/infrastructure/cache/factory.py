import os
import logging
from typing import Optional
from . import CacheProvider, CacheService, InMemoryCacheProvider
from .redis_provider import RedisCacheProvider

logger = logging.getLogger(__name__)


class CacheFactory:
    """Factory for creating cache providers and services."""
    
    @staticmethod
    def create_provider(provider_type: Optional[str] = None) -> CacheProvider:
        """
        Create a cache provider based on configuration.
        
        Args:
            provider_type: Type of cache provider ('memory', 'redis', or None for auto-detect)
        
        Returns:
            CacheProvider instance
        """
        provider_type = provider_type or os.getenv('CACHE_PROVIDER', 'memory').lower()
        
        if provider_type == 'memory':
            return InMemoryCacheProvider()
        
        elif provider_type == 'redis':
            return CacheFactory._create_redis_provider()
        
        else:
            logger.warning(f"Unknown cache provider type: {provider_type}, falling back to memory")
            return InMemoryCacheProvider()
    
    @staticmethod
    def _create_redis_provider() -> RedisCacheProvider:
        """Create Redis cache provider with environment configuration."""
        try:
            return RedisCacheProvider(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', '6379')),
                db=int(os.getenv('REDIS_DB', '0')),
                password=os.getenv('REDIS_PASSWORD'),
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to create Redis provider: {str(e)}")
            logger.warning("Falling back to in-memory cache")
            return InMemoryCacheProvider()
    
    @staticmethod
    def create_service(provider_type: Optional[str] = None, 
                      default_ttl_seconds: Optional[int] = None) -> CacheService:
        """
        Create a cache service with provider and configuration.
        
        Args:
            provider_type: Type of cache provider
            default_ttl_seconds: Default TTL for cache entries
        
        Returns:
            CacheService instance
        """
        provider = CacheFactory.create_provider(provider_type)
        ttl = default_ttl_seconds or int(os.getenv('CACHE_DEFAULT_TTL_SECONDS', '3600'))
        
        return CacheService(provider=provider, default_ttl_seconds=ttl)
