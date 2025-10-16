# app/domain/ai_service.py
"""
Abstract interface for AI recommendation services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from .ai_models import RecommendationRequest, RecommendationResult


class AIRecommendationService(ABC):
    """Abstract interface for AI recommendation services."""
    
    @abstractmethod
    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResult:
        """
        Generate training recommendations based on performance data.
        
        Args:
            request: The recommendation request containing performance data
            
        Returns:
            RecommendationResult with AI-generated suggestions
            
        Raises:
            AIProviderError: If the AI service fails
        """
        pass
    
    @abstractmethod
    def count_tokens(self, text: str) -> int:
        """
        Count the number of tokens in a text string.
        
        Args:
            text: The text to count tokens for
            
        Returns:
            Number of tokens
        """
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """
        Get the name of the AI provider.
        
        Returns:
            Provider name
        """
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """
        Get the name of the AI model being used.
        
        Returns:
            Model name
        """
        pass


class AIProviderError(Exception):
    """Exception raised when AI provider operations fail."""
    
    def __init__(self, message: str, provider: str = None, error_code: str = None):
        self.message = message
        self.provider = provider
        self.error_code = error_code
        super().__init__(self.message)
