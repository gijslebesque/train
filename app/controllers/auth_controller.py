# app/controllers/auth_controller.py
"""
Authentication controller for Strava OAuth operations.
"""

import os
from typing import Dict, Any
from ..controllers.base_controller import BaseController
from ..services.token_service import TokenService


class AuthController(BaseController):
    """Controller for authentication operations."""
    
    def __init__(self, token_service: TokenService):
        super().__init__()  # Initialize base controller
        self.token_service = token_service
        self.strava_client_id = os.getenv("STRAVA_CLIENT_ID")
        self.strava_client_secret = os.getenv("STRAVA_CLIENT_SECRET")
        self.redirect_uri = "http://localhost:3000/callback"
    
    def get_auth_url(self) -> Dict[str, Any]:
        """Get Strava OAuth2 authorization URL."""
        if not self.strava_client_id:
            return self.error_response("Strava client ID not configured", "configuration_error")
        
        url = (
            f"https://www.strava.com/oauth/authorize?client_id={self.strava_client_id}"
            f"&response_type=code&redirect_uri={self.redirect_uri}"
            f"&scope=read,activity:read_all"
        )
        
        return self.success_response({"auth_url": url}, "Authorization URL generated")
    
    def exchange_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token."""
        import requests
        
        try:
            response = requests.post(
                "https://www.strava.com/oauth/token",
                data={
                    "client_id": self.strava_client_id,
                    "client_secret": self.strava_client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                },
                timeout=10
            )
            
            if response.status_code != 200:
                return self.error_response(
                    f"Token exchange failed: {response.text}", 
                    "token_exchange_error"
                )
            
            data = response.json()
            
            # Store tokens using the service
            self.token_service.store_tokens(
                access_token=data["access_token"],
                refresh_token=data["refresh_token"],
                expires_at=data["expires_at"],
                athlete_id=data.get("athlete", {}).get("id")
            )
            
            return self.success_response(
                {"status": "connected", "athlete_id": data.get("athlete", {}).get("id")},
                "Successfully connected to Strava"
            )
            
        except requests.RequestException as e:
            return self.error_response(f"Network error: {str(e)}", "network_error")
        except Exception as e:
            return self.error_response(f"Unexpected error: {str(e)}", "unexpected_error")
    
    def get_token_status(self) -> Dict[str, Any]:
        """Get current token status."""
        tokens = self.token_service.get_tokens()
        if not tokens:
            return self.success_response(
                {"status": "no_tokens", "message": "No tokens stored"},
                "No tokens available"
            )
        
        return self.success_response({
            "status": "tokens_available",
            "is_expired": tokens.is_expired(),
            "time_until_expiry": tokens.time_until_expiry(),
            "athlete_id": tokens.athlete_id
        }, "Token status retrieved")
