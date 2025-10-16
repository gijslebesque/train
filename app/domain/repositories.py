# app/domain/repositories.py
"""
Repository interfaces for the Sporty application.
Defines contracts for data access operations.
"""

from abc import ABC, abstractmethod
from typing import Optional
from .models import StravaTokens


class TokenRepository(ABC):
    """Abstract repository for managing Strava tokens."""
    
    @abstractmethod
    def save_tokens(self, tokens: StravaTokens) -> None:
        """Save Strava tokens."""
        pass
    
    @abstractmethod
    def get_tokens(self) -> Optional[StravaTokens]:
        """Get stored Strava tokens."""
        pass
    
    @abstractmethod
    def delete_tokens(self) -> None:
        """Delete stored Strava tokens."""
        pass
    
    @abstractmethod
    def has_tokens(self) -> bool:
        """Check if tokens are stored."""
        pass
