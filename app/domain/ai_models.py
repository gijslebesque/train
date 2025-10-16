# app/domain/ai_models.py
"""
Domain models for AI recommendation services.
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from enum import Enum


class AIProvider(Enum):
    """Supported AI providers."""
    OPENAI = "openai"
    OLLAMA = "ollama"
    ANTHROPIC = "anthropic"


@dataclass
class TokenUsage:
    """Token usage statistics for AI requests."""
    input_tokens: int
    output_tokens: int
    total_tokens: int
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "total_tokens": self.total_tokens
        }


@dataclass
class AIResponse:
    """Response from AI service."""
    content: str
    token_usage: TokenUsage
    model_used: str
    provider: AIProvider
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "content": self.content,
            "token_usage": self.token_usage.to_dict(),
            "model_used": self.model_used,
            "provider": self.provider.value
        }


@dataclass
class RecommendationRequest:
    """Request for AI recommendations."""
    performance_summary: str
    performance_metrics: Dict[str, Any]
    context: Optional[str] = None
    max_tokens: Optional[int] = None
    
    def to_prompt(self) -> str:
        """Convert request to AI prompt."""
        prompt = f"""
        You are a professional triathlon and fitness coach. Based on this performance data:
        {self.performance_summary}
        
        Please provide specific, actionable training recommendations for the next week. Focus on:
        1. Areas for improvement
        2. Specific training suggestions
        3. Recovery recommendations
        4. Performance goals
        """
        
        if self.context:
            prompt += f"\n\nAdditional context: {self.context}"
            
        return prompt.strip()


@dataclass
class RecommendationResult:
    """Result of recommendation generation."""
    recommendations: str
    performance_summary: str
    performance_metrics: Dict[str, Any]
    ai_response: AIResponse
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "recommendations": self.recommendations,
            "summary": self.performance_summary,
            "metrics": self.performance_metrics,
            "token_usage": self.ai_response.token_usage.to_dict(),
            "model_used": self.ai_response.model_used,
            "provider": self.ai_response.provider.value
        }
