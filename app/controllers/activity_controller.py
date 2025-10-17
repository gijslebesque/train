# app/controllers/activity_controller.py
"""
Activity controller for Strava activity operations.
"""

import os
import requests
import time
from datetime import datetime, timedelta
from typing import Dict, Any
from ..controllers.base_controller import BaseController
from ..services.token_service import TokenService
from ..data_processor import extract_performance_stats


class ActivityController(BaseController):
    """Controller for activity operations."""
    
    def __init__(self, token_service: TokenService):
        super().__init__()  # Initialize base controller
        self.token_service = token_service
        self.strava_base = "https://www.strava.com/api/v3"
    
    def get_activities(self) -> Dict[str, Any]:
        """Fetch Strava activities from the last 30 days."""
        access_token = self.token_service.get_access_token()
        if not access_token:
            return self.error_response("Not authenticated with Strava", "not_authenticated")
        
        try:
            # Calculate epoch timestamp for 30 days ago
            thirty_days_ago = datetime.now() - timedelta(days=30)
            after_timestamp = int(thirty_days_ago.timestamp())
            
            response = requests.get(
                f"{self.strava_base}/athlete/activities",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "after": after_timestamp,
                    "per_page": 200  # Get more activities to ensure we capture all from last 30 days
                },
                timeout=10
            )
            
            if response.status_code != 200:
                return self.error_response(
                    f"Strava API error: {response.text}", 
                    "strava_api_error"
                )
            
            raw_activities = response.json()
            performance_stats = extract_performance_stats(raw_activities)
            
            return self.success_response({
                "total_activities": len(performance_stats),
                "performance_activities": len(performance_stats),
                "activities": performance_stats
            }, "Activities retrieved successfully")
            
        except requests.RequestException as e:
            return self.error_response(f"Network error: {str(e)}", "network_error")
        except Exception as e:
            return self.error_response(f"Unexpected error: {str(e)}", "unexpected_error")
