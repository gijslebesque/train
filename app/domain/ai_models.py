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
    activities_data:Dict[str, Any]
    context: Optional[str] = None
    max_tokens: Optional[int] = None
    
    def to_prompt(self) -> str:
        """Convert request to AI prompt."""
        prompt = f"""
### Role
You are an advanced personal trainer and performance strategist for experienced athletes.  
Your task is to create a scientifically balanced, and performance-optimized *weekly training schedule* based on the athlete's latest workout history.

---

### Analysis Goals

1.⁠ ⁠Plan next-week workouts accordingly:
   - Balance between endurance, strength, and recovery
   - Increase challenge gradually where improvement is possible  
   - Prioritize recovery when fatigue is detected  

---

### Output Requirements
Provide the following each time:
1.⁠ ⁠*7-Day Workout Schedule* (detailed daily plan)


### Latest Activity Data
{self.activities_data}

        """
        
        if self.context:
            prompt += f"\n\n### Additional Context\n{self.context}"
            
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


# add workout schedule schema
@dataclass
class WorkoutSchedule:
    """Workout schedule for a week."""
    date: str
    workout: str
    distance: float
    time: float
    pace: float
    notes: str

    def to_json(self) -> str:
        """Convert to JSON."""
        return json.dumps(self.to_dict())

