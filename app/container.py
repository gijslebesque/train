# app/container.py
import logging
"""
Dependency injection container for the Sporty application.
Manages dependencies and provides instances of services.
"""

import os
from .infrastructure.repositories import InMemoryTokenRepository, DatabaseTokenRepository
from .infrastructure.database import create_tables
from .services.token_service import TokenService



class Container:
    """Dependency injection container."""
    
    def __init__(self):
        # Determine which repository to use based on environment
        use_database = os.getenv("USE_DATABASE", "false").lower() == "true"
        print(f"Using actual database: {use_database}")
        
        if use_database:
            # Create database tables if they don't exist
            create_tables()
            self._token_repository = DatabaseTokenRepository()
        else:
            # Use in-memory repository
            self._token_repository = InMemoryTokenRepository()
        
        # Initialize services
        self._token_service = TokenService(self._token_repository)
    
    @property
    def token_service(self) -> TokenService:
        """Get the token service instance."""
        return self._token_service
    
    def cleanup(self):
        """Cleanup resources."""
        if hasattr(self._token_repository, 'close'):
            self._token_repository.close()
