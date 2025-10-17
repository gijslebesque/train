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
        json_example = '''{
  "week_of": "2025-10-17",
  "workouts": [
    {
      "date": "2025-10-17",
      "workout": "Swim",
      "distance": 2500,
      "time": "40 minutes",
      "pace": "16 min/100m",
      "notes": "Focus on technique and breathing"
    },
    {
      "date": "2025-10-18",
      "workout": "Run",
      "distance": 6.5,
      "time": "30 minutes",
      "pace": "4:37 min/km",
      "notes": "Interval training: 5x800m repeats"
    },
    {
      "date": "2025-10-19",
      "workout": "Ride",
      "distance": 50,
      "time": "90 minutes",
      "pace": "33.3 km/h",
      "notes": "Hill repeats to build strength"
    },
    {
      "date": "2025-10-20",
      "workout": "Swim",
      "distance": 3000,
      "time": "50 minutes",
      "pace": "16:40 min/100m",
      "notes": "Endurance swim with focus on form"
    },
    {
      "date": "2025-10-21",
      "workout": "Run",
      "distance": 7,
      "time": "40 minutes",
      "pace": "5:42 min/km",
      "notes": "Steady-state run to improve aerobic capacity"
    },
    {
      "date": "2025-10-22",
      "workout": "Ride",
      "distance": 70,
      "time": "120 minutes",
      "pace": "35 km/h",
      "notes": "Long ride to build endurance"
    },
    {
      "date": "2025-10-23",
      "workout": "Rest",
      "notes": "Active recovery day, focus on stretching and mobility"
    }
  ]
}'''
        
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
You must return your response in the following JSON format (this is just an example structure):

```json
{json_example}
```

IMPORTANT: 
- Return ONLY a JSON object with the same structure as the example above
- Create a realistic 7-day training schedule based on the athlete's data
- Use appropriate dates for the upcoming week
- Include varied workout types (Run, Swim, Ride, Rest)
- Set realistic distances, times, and paces based on the athlete's performance
- No additional text or markdown formatting

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

