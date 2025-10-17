# app/controllers/activity_controller.py
"""
Activity controller for Strava activity operations.
"""

import os
import requests
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from ..controllers.base_controller import BaseController
from ..services.token_service import TokenService
from ..data_processor import extract_performance_stats
from ..infrastructure.cache.factory import CacheFactory

logger = logging.getLogger(__name__)


class ActivityController(BaseController):
    """Controller for activity operations."""
    
    def __init__(self, token_service: TokenService, cache_service=None):
        super().__init__()  # Initialize base controller
        self.token_service = token_service
        self.strava_base = "https://www.strava.com/api/v3"
        self.cache_service = cache_service or CacheFactory.create_service()
        logger.info(f"ActivityController initialized with cache: {type(self.cache_service.provider).__name__}")
    
    def get_activities(self, use_cache: bool = True, cache_ttl_seconds: int = 300) -> Dict[str, Any]:
        """
        Fetch Strava activities from the last 30 days.
        
        Args:
            use_cache: Whether to use caching for the request
            cache_ttl_seconds: TTL for cached results in seconds (default: 5 minutes)
        """
        access_token = self.token_service.get_access_token()
        if not access_token:
            return self.error_response("Not authenticated with Strava", "not_authenticated")
        
        try:
            # Calculate epoch timestamp for 30 days ago
            thirty_days_ago = datetime.now() - timedelta(days=30)
            after_timestamp = int(thirty_days_ago.timestamp())
            
            # Create cache key based on user and time window
            cache_data = {
                'user_token_hash': hash(access_token) % 1000000,  # Simple hash for privacy
                'after_timestamp': after_timestamp,
                'per_page': 200
            }
            
            # Try to get from cache first
            if use_cache:
                cached_result = self.cache_service.get('activities', cache_data)
                if cached_result:
                    logger.info("Returning cached activities data")
                    return self.success_response(cached_result, "Activities retrieved from cache")
            
            # Fetch from Strava API
            response = requests.get(
                f"{self.strava_base}/athlete/activities",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "after": after_timestamp,
                    "per_page": 200  # Get more activities to ensure we capture all from last 30 days
                },
                timeout=10
            )
            
            if response.status_code != 200:
                return self.error_response(
                    f"Strava API error: {response.text}", 
                    "strava_api_error"
                )
            
            raw_activities = response.json()
            performance_stats = extract_performance_stats(raw_activities)
            
            result = {
                "total_activities": len(performance_stats),
                "performance_activities": len(performance_stats),
                "activities": performance_stats
            }
            
            # Cache the result
            if use_cache:
                self.cache_service.set('activities', cache_data, result, cache_ttl_seconds)
                logger.info(f"Cached activities data with TTL: {cache_ttl_seconds}s")
            
            logger.info(f"Retrieved {len(performance_stats)} activities from Strava API")
            return self.success_response(result, "Activities retrieved successfully")
            
        except requests.RequestException as e:
            return self.error_response(f"Network error: {str(e)}", "network_error")
        except Exception as e:
            return self.error_response(f"Unexpected error: {str(e)}", "unexpected_error")
    
    def clear_activities_cache(self) -> Dict[str, Any]:
        """Clear the activities cache."""
        try:
            # Clear only activities cache entries
            success = self.cache_service.delete('activities', {})
            if success:
                return self.success_response(
                    {"message": "Activities cache cleared successfully"},
                    "Activities cache cleared"
                )
            else:
                return self.error_response(
                    "Failed to clear activities cache",
                    "cache_clear_failed"
                )
        except Exception as e:
            logger.error(f"Error clearing activities cache: {str(e)}")
            return self.error_response(
                f"Error clearing activities cache: {str(e)}",
                "cache_clear_error"
            )
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        try:
            stats = self.cache_service.get_stats()
            return self.success_response(stats, "Cache statistics retrieved")
        except Exception as e:
            logger.error(f"Error getting cache stats: {str(e)}")
            return self.error_response(
                f"Error getting cache stats: {str(e)}",
                "cache_stats_error"
            )
