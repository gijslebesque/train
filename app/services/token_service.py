# app/services/token_service.py
"""
Service layer for token management.
Contains business logic for token operations.
"""

from typing import Optional
from ..domain.models import StravaTokens
from ..domain.repositories import TokenRepository


class TokenService:
    """Service for managing Strava tokens."""
    
    def __init__(self, token_repository: TokenRepository):
        self._token_repository = token_repository
    
    def store_tokens(self, access_token: str, refresh_token: str, expires_at: int, athlete_id: Optional[int] = None) -> None:
        """Store Strava tokens."""
        tokens = StravaTokens(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_at=expires_at,
            athlete_id=athlete_id
        )
        self._token_repository.save_tokens(tokens)
    
    def get_valid_tokens(self) -> Optional[StravaTokens]:
        """Get valid (non-expired) tokens."""
        tokens = self._token_repository.get_tokens()
        if tokens and not tokens.is_expired():
            return tokens
        return None
    
    def get_tokens(self) -> Optional[StravaTokens]:
        """Get stored tokens (regardless of expiry)."""
        return self._token_repository.get_tokens()
    
    def clear_tokens(self) -> None:
        """Clear stored tokens."""
        self._token_repository.delete_tokens()
    
    def has_valid_tokens(self) -> bool:
        """Check if valid tokens are available."""
        tokens = self.get_valid_tokens()
        return tokens is not None
    
    def get_access_token(self) -> Optional[str]:
        """Get the current access token if valid."""
        tokens = self.get_valid_tokens()
        return tokens.access_token if tokens else None
