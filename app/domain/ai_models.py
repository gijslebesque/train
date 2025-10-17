# app/domain/ai_models.py
"""
Domain models for AI recommendation services.
"""

from dataclasses import dataclass
from typing import Dict, Any, List, Optional
from enum import Enum
import json


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

### Analysis Goals
Plan next-week workouts accordingly:
- Balance between endurance, strength, and recovery
- Increase challenge gradually where improvement is possible  
- Prioritize recovery when fatigue is detected  

### Output Requirements
Return ONLY a JSON object matching this schema:

```json
{{
  "week_of": "YYYY-MM-DD",
  "workouts": [
    {{
      "date": "YYYY-MM-DD",
      "workout": "string",
      "distance": number,
      "time": "string",
      "pace": "string",
      "notes": "string"
    }}
  ]
}}
```

Schema fields:
- week_of: Start date of the training week (YYYY-MM-DD format)
- workouts: Array of 7 workout objects (one per day)
- date: Workout date (YYYY-MM-DD format)
- workout: Type of workout (Run, Swim, Ride, Rest, etc.)
- distance: Distance in appropriate units (km for runs/rides, meters for swims)
- time: Duration as string (e.g., "40 minutes", "1.5 hours")
- pace: Pace/speed as string (e.g., "5:30 min/km", "16 min/100m", "25 km/h")
- notes: Training focus and instructions

Create a realistic 7-day training schedule based on the athlete's data. Use appropriate dates for the upcoming week and include varied workout types.

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
    parsed_schedule: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        result = {
            "recommendations": self.recommendations,
            "summary": self.performance_summary,
            "metrics": self.performance_metrics,
            "token_usage": self.ai_response.token_usage.to_dict(),
            "model_used": self.ai_response.model_used,
            "provider": self.ai_response.provider.value
        }
        
        # Add parsed schedule if available
        if self.parsed_schedule:
            result["schedule"] = self.parsed_schedule
            
        return result


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

