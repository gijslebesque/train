# app/main.py
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
import logging
import json
import os
from dotenv import load_dotenv
from .container import Container

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
def get_cors_origins():
    """Get CORS origins from environment variable."""
    origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize dependency injection container
container = Container()


def create_response_with_status(data: dict) -> Response:
    """Create a FastAPI Response with the appropriate status code from the data."""
    status_code = data.get("_status_code", 200)
    # Remove _status_code from the response body
    response_data = {k: v for k, v in data.items() if k != "_status_code"}
    return Response(
        content=json.dumps(response_data),
        status_code=status_code,
        media_type="application/json"
    )

@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Sporty API is running!", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    result = container.system_controller.get_health_status()
    return create_response_with_status(result)


@app.get("/auth/strava")
def authorize_strava():
    """Redirect user to Strava OAuth2 authorization."""
    result = container.auth_controller.get_auth_url()
    return create_response_with_status(result)


@app.get("/exchange_token")
def exchange_token(code: str):
    """Exchange code for access token."""
    result = container.auth_controller.exchange_token(code)
    return create_response_with_status(result)


@app.get("/token_status")
def get_token_status():
    """Get current token status."""
    result = container.auth_controller.get_token_status()
    return create_response_with_status(result)


@app.get("/storage_info")
def get_storage_info():
    """Get information about the current storage method."""
    result = container.system_controller.get_storage_info()
    return create_response_with_status(result)


@app.get("/activities")
def get_activities():
    """Fetch recent Strava activities."""
    result = container.activity_controller.get_activities()
    return create_response_with_status(result)


@app.get("/recommendations")
def get_training_recommendations():
    """Generate training suggestions using the LLM."""
    result = container.recommendation_controller.get_training_recommendations()
    return create_response_with_status(result)


@app.get("/ai_provider_info")
def get_ai_provider_info():
    """Get information about the current AI provider."""
    result = container.recommendation_controller.get_provider_info()
    return create_response_with_status(result)


@app.delete("/cache")
def clear_cache():
    """Clear the recommendations cache."""
    result = container.recommendation_controller.clear_cache()
    return create_response_with_status(result)


@app.get("/cache/stats")
def get_cache_stats():
    """Get cache statistics."""
    result = container.recommendation_controller.get_cache_stats()
    return create_response_with_status(result)
