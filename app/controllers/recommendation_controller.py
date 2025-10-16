# app/controllers/recommendation_controller.py
"""
Recommendation controller for AI-powered training suggestions.
"""

import os
import tiktoken
import logging
from typing import Dict, Any
from openai import OpenAI
from ..controllers.base_controller import BaseController
from ..services.token_service import TokenService
from ..data_processor import calculate_performance_metrics, create_performance_summary
from ..controllers.activity_controller import ActivityController

logger = logging.getLogger(__name__)


class RecommendationController(BaseController):
    """Controller for AI recommendation operations."""
    
    def __init__(self, token_service: TokenService, activity_controller: ActivityController):
        self.token_service = token_service
        self.activity_controller = activity_controller
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")
    
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.tokenizer.encode(text))
    
    def get_training_recommendations(self) -> Dict[str, Any]:
        """Generate training suggestions using AI."""
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
        
        # Calculate metrics and create summary
        metrics = calculate_performance_metrics(activities_data)
        summary = create_performance_summary(activities_data)
        
        # Create AI prompt
        prompt = f"""
        You are a professional triathlon and fitness coach. Based on this performance data:
        {summary}
        
        Please provide specific, actionable training recommendations for the next week. Focus on:
        1. Areas for improvement
        2. Specific training suggestions
        3. Recovery recommendations
        4. Performance goals
        """
        
        # Check token usage
        model = "gpt-3.5-turbo"
        token_count = self.count_tokens(prompt)
        
        # Log token usage
        logger.info(f"Token usage for {model}: {token_count} tokens")
        
        if token_count > 4096:
            return self.error_response(
                "The prompt is too long for the selected model. Please reduce the input size.",
                "token_limit_exceeded"
            )
        
        try:
            completion = self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = completion.choices[0].message.content
            response_tokens = self.count_tokens(response_text)
            
            logger.info(f"OpenAI API call successful. Response tokens: {response_tokens}")
            
            return self.success_response({
                "summary": summary,
                "suggestions": response_text,
                "metrics": metrics,
                "token_usage": {
                    "input_tokens": token_count,
                    "output_tokens": response_tokens,
                    "total_tokens": token_count + response_tokens
                }
            }, "Training recommendations generated successfully")
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self.error_response(f"AI service error: {str(e)}", "ai_service_error")
