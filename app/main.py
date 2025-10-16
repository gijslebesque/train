# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv
from .container import Container

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize dependency injection container
container = Container()


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Sporty API is running!", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return container.system_controller.get_health_status()


@app.get("/auth/strava")
def authorize_strava():
    """Redirect user to Strava OAuth2 authorization."""
    return container.auth_controller.get_auth_url()


@app.get("/exchange_token")
def exchange_token(code: str):
    """Exchange code for access token."""
    return container.auth_controller.exchange_token(code)


@app.get("/token_status")
def get_token_status():
    """Get current token status."""
    return container.auth_controller.get_token_status()


@app.get("/storage_info")
def get_storage_info():
    """Get information about the current storage method."""
    return container.system_controller.get_storage_info()


@app.get("/activities")
def get_activities():
    """Fetch recent Strava activities."""
    return container.activity_controller.get_activities()


@app.get("/recommendations")
def get_training_recommendations():
    """Generate training suggestions using the LLM."""
    return container.recommendation_controller.get_training_recommendations()
