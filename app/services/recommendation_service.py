# app/services/recommendation_service.py
"""
Service layer for AI recommendations.
"""

import logging
from typing import Dict, Any, List

from ..domain.ai_service import AIRecommendationService, AIProviderError
from ..domain.ai_models import RecommendationRequest, RecommendationResult
from ..data_processor import calculate_performance_metrics, create_performance_summary

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service for generating AI-powered training recommendations."""
    
    def __init__(self, ai_service: AIRecommendationService):
        """
        Initialize recommendation service.
        
        Args:
            ai_service: The AI service to use for generating recommendations
        """
        self.ai_service = ai_service
        logger.info(f"RecommendationService initialized with {ai_service.get_provider_name()}")
    
    def generate_training_recommendations(
        self, 
        activities_data: List[Dict[str, Any]], 
        context: str = None
    ) -> RecommendationResult:
        """
        Generate training recommendations based on activity data.
        
        Args:
            activities_data: List of activity data from Strava
            context: Optional additional context for recommendations
            
        Returns:
            RecommendationResult with AI-generated suggestions
            
        Raises:
            AIProviderError: If the AI service fails
        """
        if not activities_data:
            raise ValueError("No activities data provided")
        
        # Calculate performance metrics
        metrics = calculate_performance_metrics(activities_data)
        
        # Create performance summary
        summary = create_performance_summary(activities_data)
        
        # Create recommendation request
        request = RecommendationRequest(
            performance_summary=summary,
            performance_metrics=metrics,
            context=context,
            max_tokens=4096
        )
        
        logger.info(f"Generating recommendations for {len(activities_data)} activities")
        
        # Generate recommendations using AI service
        result = self.ai_service.generate_recommendations(request)
        
        logger.info(
            f"Recommendations generated successfully using {result.ai_response.provider.value} "
            f"({result.ai_response.model_used}). Total tokens: {result.ai_response.token_usage.total_tokens}"
        )
        
        return result
    
    def get_provider_info(self) -> Dict[str, str]:
        """Get information about the current AI provider."""
        return {
            "provider": self.ai_service.get_provider_name(),
            "model": self.ai_service.get_model_name()
        }
