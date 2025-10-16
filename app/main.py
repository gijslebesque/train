# app/main.py
from fastapi import FastAPI, Request
import requests
import os
import tiktoken
import logging
from datetime import datetime, timedelta
from typing import Dict
from openai import OpenAI
from dotenv import load_dotenv
from .data_processor import extract_performance_stats, calculate_performance_metrics, create_performance_summary
from .container import Container

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize tokenizer for gpt-3.5-turbo
tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/exchange_token"
STRAVA_BASE = "https://www.strava.com/api/v3"

# Initialize dependency injection container
container = Container()


def count_tokens(text: str) -> int:
    """Count the number of tokens in a text string."""
    return len(tokenizer.encode(text))


def log_token_usage(prompt: str, model: str = "gpt-3.5-turbo"):
    """Log token usage information before making API call."""
    token_count = count_tokens(prompt)
    
    # Token limits for different models
    limits = {
        "gpt-3.5-turbo": 4096,
        "gpt-4": 8192,
        "gpt-4-turbo": 128000,
        "gpt-5": 128000
    }
    
    limit = limits.get(model, 4096)
    usage_percentage = (token_count / limit) * 100
    
    logger.info(f"Token usage for {model}:")
    logger.info(f"  Input tokens: {token_count}")
    logger.info(f"  Model limit: {limit}")
    logger.info(f"  Usage: {usage_percentage:.1f}%")
    
    if token_count > limit:
        logger.warning(f"⚠️  Token limit exceeded! Input tokens ({token_count}) > limit ({limit})")
        return False
    elif usage_percentage > 80:
        logger.warning(f"⚠️  High token usage: {usage_percentage:.1f}% of limit")
    
    return True


@app.get("/auth/strava")
def authorize_strava():
    """Redirect user to Strava OAuth2 authorization."""
    url = (
        f"https://www.strava.com/oauth/authorize?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code&redirect_uri={REDIRECT_URI}"
        f"&scope=read,activity:read_all"
    )
    return {"auth_url": url}


@app.get("/exchange_token")
def exchange_token(code: str):
    """Exchange code for access token."""
    response = requests.post(
        "https://www.strava.com/oauth/token",
        data={
            "client_id": STRAVA_CLIENT_ID,
            "client_secret": STRAVA_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
        },
    )
    data = response.json()
    
    # Use the token service to store tokens
    container.token_service.store_tokens(
        access_token=data["access_token"],
        refresh_token=data["refresh_token"],
        expires_at=data["expires_at"],
        athlete_id=data.get("athlete", {}).get("id")
    )
    
    return {"status": "connected"}


@app.get("/token_status")
def get_token_status():
    """Get current token status."""
    tokens = container.token_service.get_tokens()
    if not tokens:
        return {"status": "no_tokens", "message": "No tokens stored"}
    
    return {
        "status": "tokens_available",
        "is_expired": tokens.is_expired(),
        "time_until_expiry": tokens.time_until_expiry(),
        "athlete_id": tokens.athlete_id
    }


@app.get("/activities")
def get_activities():
    """Fetch recent Strava activities."""
    access_token = container.token_service.get_access_token()
    if not access_token:
        return {"error": "not_authenticated"}

    res = requests.get(
        f"{STRAVA_BASE}/athlete/activities",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"per_page": 50},
    )
    
    if res.status_code != 200:
        return {"error": "strava_api_error", "message": res.text}
    
    raw_activities = res.json()
    performance_stats = extract_performance_stats(raw_activities)
    
    return {
        "total_activities": len(raw_activities),
        "performance_activities": len(performance_stats),
        "activities": performance_stats
    }


@app.get("/recommendations")
def get_training_recommendations():
    """Generate training suggestions using the LLM."""
    activities = get_activities()
    if "error" in activities:
        return activities

    # Extract performance data from the new filtered response
    activities_data = activities.get("activities", [])
    if not activities_data:
        return {"error": "no_performance_data", "message": "No activities with performance data found"}

    # Use the data processor functions
    metrics = calculate_performance_metrics(activities_data)
    summary = create_performance_summary(activities_data)

    # Ask the LLM for insights
    prompt = f"""
    You are a professional triathlon and fitness coach. Based on this performance data:
    {summary}
    
    Please provide specific, actionable training recommendations for the next week. Focus on:
    1. Areas for improvement
    2. Specific training suggestions
    3. Recovery recommendations
    4. Performance goals
    """

    # Check token usage before making the request
    model = "gpt-5"
    token_count = count_tokens(prompt)
    
    # Log token usage with clear visibility
    print(f"\n🔢 TOKEN USAGE:")
    print(f"   Input tokens: {token_count}")
    print(f"   Model: {model}")
    print(f"   Limit: 4,096 tokens")
    print(f"   Usage: {(token_count/4096)*100:.1f}%")
    print(f"   Prompt: {prompt.strip()}")
    print(f"   {'='*50}")
    
    if not log_token_usage(prompt, model):
        return {
            "error": "token_limit_exceeded",
            "message": "The prompt is too long for the selected model. Please reduce the input size.",
            "summary": summary,
            "token_count": token_count
        }

    try:
        completion = client.responses.create(
            model=model,
            input= prompt
        )
        
        # Get response token count
        response_text = completion.choices[0].message.content
        response_tokens = count_tokens(response_text)
        total_tokens = completion.usage.total_tokens if hasattr(completion, 'usage') else token_count + response_tokens
        
        print(f"\n✅ OPENAI RESPONSE:")
        print(f"   Input tokens: {token_count}")
        print(f"   Output tokens: {response_tokens}")
        print(f"   Total tokens: {total_tokens}")
        print(f"   {'='*50}\n")
        
        logger.info("✅ OpenAI API call successful")
        return {
            "summary": summary, 
            "suggestions": response_text,
            "metrics": metrics,
            "token_usage": {
                "input_tokens": token_count,
                "output_tokens": response_tokens,
                "total_tokens": total_tokens
            }
        }
    
    except Exception as e:
        logger.error(f"❌ OpenAI API error: {str(e)}")
        return {
            "error": "openai_api_error",
            "message": str(e),
            "summary": summary
        }
