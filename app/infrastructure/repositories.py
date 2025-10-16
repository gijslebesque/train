# app/infrastructure/repositories.py
"""
Infrastructure layer implementations of repositories.
Contains concrete implementations for data access.
"""

from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..domain.models import StravaTokens
from ..domain.repositories import TokenRepository
from .database import StravaTokensModel, SessionLocal


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


class DatabaseTokenRepository(TokenRepository):
    """Database implementation of TokenRepository using PostgreSQL."""
    
    def __init__(self):
        self._db: Optional[Session] = None
    
    def _get_db(self) -> Session:
        """Get database session."""
        if not self._db:
            self._db = SessionLocal()
        return self._db
    
    def save_tokens(self, tokens: StravaTokens) -> None:
        """Save Strava tokens to database."""
        db = self._get_db()
        
        # Check if tokens already exist for this athlete
        existing_tokens = db.query(StravaTokensModel).filter(
            StravaTokensModel.athlete_id == tokens.athlete_id
        ).first()
        
        if existing_tokens:
            # Update existing tokens
            existing_tokens.access_token = tokens.access_token
            existing_tokens.refresh_token = tokens.refresh_token
            existing_tokens.expires_at = tokens.expires_at
            existing_tokens.updated_at = datetime.now()
        else:
            # Create new tokens
            db_tokens = StravaTokensModel(
                athlete_id=tokens.athlete_id,
                access_token=tokens.access_token,
                refresh_token=tokens.refresh_token,
                expires_at=tokens.expires_at,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(db_tokens)
        
        db.commit()
    
    def get_tokens(self) -> Optional[StravaTokens]:
        """Get stored Strava tokens from database."""
        db = self._get_db()
        
        db_tokens = db.query(StravaTokensModel).first()
        if not db_tokens:
            return None
        
        return StravaTokens(
            access_token=db_tokens.access_token,
            refresh_token=db_tokens.refresh_token,
            expires_at=db_tokens.expires_at,
            athlete_id=db_tokens.athlete_id
        )
    
    def delete_tokens(self) -> None:
        """Delete stored Strava tokens from database."""
        db = self._get_db()
        db.query(StravaTokensModel).delete()
        db.commit()
    
    def has_tokens(self) -> bool:
        """Check if tokens are stored in database."""
        db = self._get_db()
        return db.query(StravaTokensModel).first() is not None
    
    def close(self):
        """Close database session."""
        if self._db:
            self._db.close()
            self._db = None
