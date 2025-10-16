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
from .controllers.auth_controller import AuthController
from .controllers.activity_controller import ActivityController
from .controllers.recommendation_controller import RecommendationController
from .controllers.system_controller import SystemController



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
        
        # Initialize controllers
        self._auth_controller = AuthController(self._token_service)
        self._activity_controller = ActivityController(self._token_service)
        self._recommendation_controller = RecommendationController(
            self._token_service, 
            self._activity_controller
        )
        self._system_controller = SystemController()
    
    @property
    def token_service(self) -> TokenService:
        """Get the token service instance."""
        return self._token_service
    
    @property
    def auth_controller(self) -> AuthController:
        """Get the auth controller instance."""
        return self._auth_controller
    
    @property
    def activity_controller(self) -> ActivityController:
        """Get the activity controller instance."""
        return self._activity_controller
    
    @property
    def recommendation_controller(self) -> RecommendationController:
        """Get the recommendation controller instance."""
        return self._recommendation_controller
    
    @property
    def system_controller(self) -> SystemController:
        """Get the system controller instance."""
        return self._system_controller
    
    def cleanup(self):
        """Cleanup resources."""
        if hasattr(self._token_repository, 'close'):
            self._token_repository.close()
