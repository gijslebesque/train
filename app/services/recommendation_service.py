# app/services/recommendation_service.py
"""
Service layer for AI recommendations.
"""

import logging
from typing import Dict, Any, List
from ..domain.ai_service import AIRecommendationService
from ..domain.ai_models import RecommendationRequest, RecommendationResult
from ..data_processor import calculate_performance_metrics, create_performance_summary
from ..infrastructure.cache.factory import CacheFactory

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for generating AI-powered training recommendations."""
    
    def __init__(self, ai_service: AIRecommendationService, cache_service=None):
        """
        Initialize recommendation service.
        
        Args:
            ai_service: The AI service to use for generating recommendations
            cache_service: Optional cache service for caching recommendations
        """
        self.ai_service = ai_service
        self.cache_service = cache_service or CacheFactory.create_service()
        logger.info(f"RecommendationService initialized with {ai_service.get_provider_name()}")
        logger.info(f"Cache service: {type(self.cache_service.provider).__name__}")
    
    def generate_training_recommendations(
        self, 
        activities_data: List[Dict[str, Any]], 
        context: str = None,
        use_cache: bool = True,
        cache_ttl_seconds: int = 3600
    ) -> RecommendationResult:
        """
        Generate training recommendations based on activity data.
        
        Args:
            activities_data: List of activity data from Strava
            context: Optional additional context for recommendations
            use_cache: Whether to use caching for the request
            cache_ttl_seconds: TTL for cached results in seconds
        
        Returns:
            RecommendationResult with AI-generated suggestions
            
        Raises:
            AIProviderError: If the AI service fails
        """
        if not activities_data:
            raise ValueError("No activities data provided")
        
        # Create cache key from activities data and context
        cache_data = {
            'activities_count': len(activities_data),
            'activities_hash': self._create_activities_hash(activities_data),
            'context': context,
            'provider': self.ai_service.get_provider_name(),
            'model': self.ai_service.get_model_name()
        }
        
        # Try to get from cache first
        if use_cache:
            cached_result = self.cache_service.get('recommendations', cache_data)
            if cached_result:
                logger.info("Returning cached recommendations")
                return cached_result
        
        # Calculate performance metrics
        metrics = calculate_performance_metrics(activities_data)
        
        # Create performance summary
        summary = create_performance_summary(activities_data)
        
        # Create recommendation request
        request = RecommendationRequest(
            activities_data=activities_data,
            performance_summary=summary,
            performance_metrics=metrics,
            context=context,
        )
        
        logger.info(f"Generating recommendations for {len(activities_data)} activities")
        
        # Generate recommendations using AI service
        result = self.ai_service.generate_recommendations(request)
        
        # Cache the result
        if use_cache:
            self.cache_service.set('recommendations', cache_data, result, cache_ttl_seconds)
            logger.info(f"Cached recommendations with TTL: {cache_ttl_seconds}s")
        
        logger.info(
            f"Recommendations generated successfully using {result.ai_response.provider.value} "
            f"({result.ai_response.model_used}). Total tokens: {result.ai_response.token_usage.total_tokens}"
        )
        
        return result
    
    def _create_activities_hash(self, activities_data: List[Dict[str, Any]]) -> str:
        """Create a hash of activities data for cache key generation."""
        import hashlib
        import json
        
        # Create a simplified representation of activities for hashing
        activities_summary = []
        for activity in activities_data:
            summary = {
                'id': activity.get('id'),
                'type': activity.get('type'),
                'distance': activity.get('distance'),
                'moving_time': activity.get('moving_time'),
                'start_date': activity.get('start_date')
            }
            activities_summary.append(summary)
        
        # Sort to ensure consistent hashing
        activities_summary.sort(key=lambda x: x.get('id', 0))
        
        # Create hash
        data_str = json.dumps(activities_summary, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def clear_recommendations_cache(self) -> bool:
        """Clear all cached recommendations."""
        return self.cache_service.clear()
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return self.cache_service.get_stats()
    
    def get_provider_info(self) -> Dict[str, str]:
        """Get information about the current AI provider."""
        return {
            "provider": self.ai_service.get_provider_name(),
            "model": self.ai_service.get_model_name()
        }
