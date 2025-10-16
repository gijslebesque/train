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

tokens = {}  # in-memory store; replace with a DB later


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
    tokens["access_token"] = data["access_token"]
    tokens["refresh_token"] = data["refresh_token"]
    tokens["expires_at"] = data["expires_at"]
    return {"status": "connected"}


@app.get("/activities")
def get_activities():
    """Fetch recent Strava activities."""
    access_token = tokens.get("access_token")
    if not access_token:
        return {"error": "not_authenticated"}

    res = requests.get(
        f"{STRAVA_BASE}/athlete/activities",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"per_page": 50},
    )
    return res.json()


@app.get("/recommendations")
def get_training_recommendations():
    """Generate training suggestions using the LLM."""
    activities = get_activities()
    if "error" in activities:
        return activities

    # Example: summarize key metrics
    total_distance = sum(a["distance"] for a in activities)
    avg_speed = sum(a["average_speed"] for a in activities) / len(activities)
    summary = f"Total distance: {total_distance/1000:.1f} km, avg speed: {avg_speed*3.6:.1f} km/h."

    # Ask the LLM for insights
    prompt = f"""
    You are a cycling coach. Based on this summary: {summary},
    suggest how I can improve performance next week.
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
