# app/container.py
import logging
"""
Dependency injection container for the Sporty application.
Manages dependencies and provides instances of services.
"""

import os
from .infrastructure.repositories import InMemoryTokenRepository, DatabaseTokenRepository
from .infrastructure.database import create_tables
from .infrastructure.ai_providers.openai_provider import OpenAIProvider
from .infrastructure.ai_providers.ollama_provider import OllamaProvider
from .services.token_service import TokenService
from .services.recommendation_service import RecommendationService
from .controllers.auth_controller import AuthController
from .controllers.activity_controller import ActivityController
from .controllers.recommendation_controller import RecommendationController
from .controllers.system_controller import SystemController
from .domain.ai_service import AIRecommendationService



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

        # Initialize AI provider based on environment
        ai_provider = os.getenv("AI_PROVIDER", "openai").lower()
        print(f"Using AI provider: {ai_provider}")
        
        self._ai_service = self._create_ai_service(ai_provider)

        # Initialize services
        self._token_service = TokenService(self._token_repository)
        self._recommendation_service = RecommendationService(self._ai_service)

        # Initialize controllers
        self._auth_controller = AuthController(self._token_service)
        self._activity_controller = ActivityController(self._token_service)
        self._recommendation_controller = RecommendationController(
            self._token_service,
            self._activity_controller,
            self._recommendation_service
        )
        self._system_controller = SystemController()
    
    def _create_ai_service(self, provider: str) -> AIRecommendationService:
        """Create AI service based on provider configuration."""
        try:
            if provider == "openai":
                model = os.getenv("OPENAI_MODEL", "gpt-5-mini")
                return OpenAIProvider(model=model)
            elif provider == "ollama":
                base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                model = os.getenv("OLLAMA_MODEL", "llama2")
                return OllamaProvider(base_url=base_url, model=model)
            else:
                raise ValueError(f"Unsupported AI provider: {provider}")
        except Exception as e:
            print(f"Failed to initialize {provider} provider: {str(e)}")
            print("Falling back to OpenAI provider")
            return OpenAIProvider()
    
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
    
    @property
    def ai_service(self) -> AIRecommendationService:
        """Get the AI service instance."""
        return self._ai_service
    
    @property
    def recommendation_service(self) -> RecommendationService:
        """Get the recommendation service instance."""
        return self._recommendation_service

    def cleanup(self):
        """Cleanup resources."""
        if hasattr(self._token_repository, 'close'):
            self._token_repository.close()
