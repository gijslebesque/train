# app/controllers/recommendation_controller.py
"""
Recommendation controller for AI-powered training suggestions.
"""

import logging
from typing import Dict, Any

from ..controllers.base_controller import BaseController
from ..services.token_service import TokenService
from ..services.recommendation_service import RecommendationService
from ..domain.ai_service import AIProviderError
from ..controllers.activity_controller import ActivityController

logger = logging.getLogger(__name__)


class RecommendationController(BaseController):
    """Controller for AI recommendation operations."""
    
    def __init__(self, token_service: TokenService, activity_controller: ActivityController, recommendation_service: RecommendationService):
        """
        Initialize recommendation controller.
        
        Args:
            token_service: Service for managing Strava tokens
            activity_controller: Controller for fetching activities
            recommendation_service: Service for generating AI recommendations
        """
        self.token_service = token_service
        self.activity_controller = activity_controller
        self.recommendation_service = recommendation_service
        
        logger.info("RecommendationController initialized")
    
    def get_training_recommendations(self) -> Dict[str, Any]:
        """Generate training suggestions using AI."""
        try:
            # Get activities first
            activities_response = self.activity_controller.get_activities()
            if not activities_response.get("success", False):
                return activities_response
            
            activities_data = activities_response["data"]["activities"]
            if not activities_data:
                return self.error_response(
                    "No activities with performance data found", 
                    "no_performance_data"
                )
            
            # Generate recommendations using the service
            result = self.recommendation_service.generate_training_recommendations(activities_data)
            
            return self.success_response(
                result.to_dict(),
                "Training recommendations generated successfully"
            )
            
        except AIProviderError as e:
            logger.error(f"AI provider error: {str(e)}")
            return self.error_response(
                f"AI service error: {e.message}",
                e.error_code or "ai_service_error"
            )
        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            return self.error_response(
                str(e),
                "validation_error"
            )
        except Exception as e:
            logger.error(f"Unexpected error in recommendation generation: {str(e)}")
            return self.error_response(
                f"An unexpected error occurred: {str(e)}",
                "internal_error"
            )
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about the current AI provider."""
        try:
            provider_info = self.recommendation_service.get_provider_info()
            return self.success_response(provider_info)
        except Exception as e:
            logger.error(f"Error getting provider info: {str(e)}")
            return self.error_response(
                f"Failed to get provider info: {str(e)}",
                "provider_info_error"
            )
