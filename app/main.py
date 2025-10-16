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


def extract_performance_stats(activities):
    """Extract only performance-related stats from Strava activities."""
    performance_stats = []
    
    for activity in activities:
        # Only include activities with performance data
        if activity.get("distance") and activity.get("moving_time"):
            stats = {
                "id": activity.get("id"),
                "name": activity.get("name"),
                "type": activity.get("type"),
                "sport_type": activity.get("sport_type"),
                "start_date": activity.get("start_date"),
                "start_date_local": activity.get("start_date_local"),
                
                # Performance metrics
                "distance": activity.get("distance"),  # meters
                "moving_time": activity.get("moving_time"),  # seconds
                "elapsed_time": activity.get("elapsed_time"),  # seconds
                "total_elevation_gain": activity.get("total_elevation_gain"),  # meters
                "average_speed": activity.get("average_speed"),  # m/s
                "max_speed": activity.get("max_speed"),  # m/s
                
                # Heart rate data (if available)
                "has_heartrate": activity.get("has_heartrate"),
                "average_heartrate": activity.get("average_heartrate"),
                "max_heartrate": activity.get("max_heartrate"),
                
                # Elevation data (if available)
                "elev_high": activity.get("elev_high"),
                "elev_low": activity.get("elev_low"),
                
                # Additional performance indicators
                "achievement_count": activity.get("achievement_count"),
                "pr_count": activity.get("pr_count"),
            }
            
            # Calculate derived metrics
            if stats["distance"] and stats["moving_time"]:
                stats["distance_km"] = round(stats["distance"] / 1000, 2)
                stats["moving_time_minutes"] = round(stats["moving_time"] / 60, 2)
                stats["average_speed_kmh"] = round(stats["average_speed"] * 3.6, 2) if stats["average_speed"] else None
                stats["max_speed_kmh"] = round(stats["max_speed"] * 3.6, 2) if stats["max_speed"] else None
                stats["pace_per_km"] = round(stats["moving_time"] / (stats["distance"] / 1000), 2) if stats["distance"] > 0 else None
            
            performance_stats.append(stats)
    
    return performance_stats


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

    # Calculate comprehensive performance metrics
    total_distance_km = sum(a["distance_km"] for a in activities_data)
    total_time_minutes = sum(a["moving_time_minutes"] for a in activities_data)
    avg_speed_kmh = sum(a["average_speed_kmh"] for a in activities_data if a["average_speed_kmh"]) / len([a for a in activities_data if a["average_speed_kmh"]])
    avg_heartrate = sum(a["average_heartrate"] for a in activities_data if a["average_heartrate"]) / len([a for a in activities_data if a["average_heartrate"]])
    total_elevation = sum(a["total_elevation_gain"] for a in activities_data)
    
    # Activity type breakdown
    activity_types = {}
    for activity in activities_data:
        sport_type = activity.get("sport_type", "Unknown")
        activity_types[sport_type] = activity_types.get(sport_type, 0) + 1

    # Create detailed summary
    summary = f"""
    Performance Summary (Last {len(activities_data)} activities):
    - Total Distance: {total_distance_km:.1f} km
    - Total Time: {total_time_minutes:.1f} minutes
    - Average Speed: {avg_speed_kmh:.1f} km/h
    - Average Heart Rate: {avg_heartrate:.0f} bpm
    - Total Elevation: {total_elevation:.0f} m
    - Activity Types: {', '.join([f'{k}: {v}' for k, v in activity_types.items()])}
    """

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
            "summary": summary.strip(), 
            "suggestions": response_text,
            "metrics": {
                "total_distance_km": round(total_distance_km, 1),
                "total_time_minutes": round(total_time_minutes, 1),
                "avg_speed_kmh": round(avg_speed_kmh, 1),
                "avg_heartrate": round(avg_heartrate, 0),
                "total_elevation": round(total_elevation, 0),
                "activity_count": len(activities_data),
                "activity_types": activity_types
            },
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
