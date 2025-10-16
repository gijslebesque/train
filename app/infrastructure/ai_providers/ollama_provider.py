# app/infrastructure/ai_providers/ollama_provider.py
"""
Ollama implementation of AI recommendation service.
"""

import requests
import logging
from typing import Dict, Any

from ...domain.ai_service import AIRecommendationService, AIProviderError
from ...domain.ai_models import (
    RecommendationRequest, 
    RecommendationResult, 
    AIResponse, 
    TokenUsage, 
    AIProvider
)

logger = logging.getLogger(__name__)


class OllamaProvider(AIRecommendationService):
    """Ollama implementation of AI recommendation service."""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama2"):
        """
        Initialize Ollama provider.
        
        Args:
            base_url: Ollama server URL
            model: Model to use for recommendations
        """
        self.base_url = base_url.rstrip('/')
        self.model = model
        
        logger.info(f"Ollama provider initialized with model: {self.model} at {self.base_url}")
    
    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResult:
        """Generate recommendations using Ollama."""
        try:
            prompt = request.to_prompt()
            
            # Count input tokens (approximation for Ollama)
            input_tokens = self.count_tokens(prompt)
            
            logger.info(f"Generating recommendations with Ollama {self.model}. Input tokens: {input_tokens}")
            
            # Make API call to Ollama
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                },
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            
            response_content = data.get("response", "")
            if not response_content:
                raise AIProviderError(
                    "Empty response from Ollama",
                    provider="ollama",
                    error_code="empty_response"
                )
            
            output_tokens = self.count_tokens(response_content)
            
            # Create token usage
            token_usage = TokenUsage(
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                total_tokens=input_tokens + output_tokens
            )
            
            # Create AI response
            ai_response = AIResponse(
                content=response_content,
                token_usage=token_usage,
                model_used=self.model,
                provider=AIProvider.OLLAMA
            )
            
            # Create result
            result = RecommendationResult(
                recommendations=response_content,
                performance_summary=request.performance_summary,
                performance_metrics=request.performance_metrics,
                ai_response=ai_response
            )
            
            logger.info(f"Ollama recommendations generated successfully. Total tokens: {token_usage.total_tokens}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama API error: {str(e)}")
            raise AIProviderError(
                f"Ollama API error: {str(e)}",
                provider="ollama",
                error_code="api_error"
            )
        except Exception as e:
            logger.error(f"Ollama error: {str(e)}")
            raise AIProviderError(
                f"Ollama error: {str(e)}",
                provider="ollama",
                error_code="unknown_error"
            )
    
    def count_tokens(self, text: str) -> int:
        """Count tokens using approximation (Ollama doesn't provide exact token counts)."""
        # Simple approximation: ~4 characters per token
        return int(len(text) / 4)
    
    def get_provider_name(self) -> str:
        """Get provider name."""
        return "Ollama"
    
    def get_model_name(self) -> str:
        """Get model name."""
        return self.model
