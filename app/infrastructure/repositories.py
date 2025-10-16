# app/infrastructure/repositories.py
"""
Infrastructure layer implementations of repositories.
Contains concrete implementations for data access.
"""

from typing import Optional
from ..domain.models import StravaTokens
from ..domain.repositories import TokenRepository


class InMemoryTokenRepository(TokenRepository):
    """In-memory implementation of TokenRepository."""
    
    def __init__(self):
        self._tokens: Optional[StravaTokens] = None
    
    def save_tokens(self, tokens: StravaTokens) -> None:
        """Save Strava tokens to memory."""
        self._tokens = tokens
    
    def get_tokens(self) -> Optional[StravaTokens]:
        """Get stored Strava tokens from memory."""
        return self._tokens
    
    def delete_tokens(self) -> None:
        """Delete stored Strava tokens from memory."""
        self._tokens = None
    
    def has_tokens(self) -> bool:
        """Check if tokens are stored in memory."""
        return self._tokens is not None
