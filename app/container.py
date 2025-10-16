# app/container.py
"""
Dependency injection container for the Sporty application.
Manages dependencies and provides instances of services.
"""

from .infrastructure.repositories import InMemoryTokenRepository
from .services.token_service import TokenService


class Container:
    """Dependency injection container."""
    
    def __init__(self):
        # Initialize repositories
        self._token_repository = InMemoryTokenRepository()
        
        # Initialize services
        self._token_service = TokenService(self._token_repository)
    
    @property
    def token_service(self) -> TokenService:
        """Get the token service instance."""
        return self._token_service
