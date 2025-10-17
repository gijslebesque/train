# app/infrastructure/ai_providers/openai_provider.py
"""
OpenAI implementation of AI recommendation service.
"""

import os
import logging
from typing import Dict, Any
from openai import OpenAI
import tiktoken

from ...domain.ai_service import AIRecommendationService, AIProviderError
from ...domain.ai_models import (
    RecommendationRequest, 
    RecommendationResult, 
    AIResponse, 
    TokenUsage, 
    AIProvider
)

logger = logging.getLogger(__name__)


class OpenAIProvider(AIRecommendationService):
    """OpenAI implementation of AI recommendation service."""
    
    def __init__(self, api_key: str = None, model: str = "gpt-3.5-turbo"):
        """
        Initialize OpenAI provider.
        
        Args:
            api_key: OpenAI API key (if None, will use OPENAI_API_KEY env var)
            model: Model to use for recommendations
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        
        if not self.api_key:
            raise ValueError("OpenAI API key is required")
        
        self.client = OpenAI(api_key=self.api_key)
        self.tokenizer = tiktoken.encoding_for_model(self.model)
        
        logger.info(f"OpenAI provider initialized with model: {self.model}")
    
    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResult:
        """Generate recommendations using OpenAI."""
        try:
            prompt = request.to_prompt()
            
            # Count input tokens
            input_tokens = self.count_tokens(prompt)
            
            # Check token limits if max_tokens is provided
            if request.max_tokens:
                max_tokens = request.max_tokens
                if input_tokens > max_tokens:
                    raise AIProviderError(
                        f"Input prompt exceeds token limit: {input_tokens} > {max_tokens}",
                        provider="openai",
                        error_code="token_limit_exceeded"
                    )
            
            logger.info(f"Generating recommendations with OpenAI {self.model}. Input tokens: {input_tokens}")
            
            # Make API call
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,  # Limit response length
                temperature=0.7
            )
            
            response_content = completion.choices[0].message.content
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
                provider=AIProvider.OPENAI
            )
            
            # Create result
            result = RecommendationResult(
                recommendations=response_content,
                performance_summary=request.performance_summary,
                performance_metrics=request.performance_metrics,
                ai_response=ai_response
            )
            
            logger.info(f"OpenAI recommendations generated successfully. Total tokens: {token_usage.total_tokens}")
            return result
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise AIProviderError(
                f"OpenAI API error: {str(e)}",
                provider="openai",
                error_code="api_error"
            )
    
    def count_tokens(self, text: str) -> int:
        """Count tokens using tiktoken."""
        try:
            return len(self.tokenizer.encode(text))
        except Exception as e:
            logger.warning(f"Token counting failed, using approximation: {str(e)}")
            # Fallback to word count approximation
            return len(text.split()) * 1.3
    
    def get_provider_name(self) -> str:
        """Get provider name."""
        return "OpenAI"
    
    def get_model_name(self) -> str:
        """Get model name."""
        return self.model
