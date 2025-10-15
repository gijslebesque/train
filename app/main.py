# app/main.py
from fastapi import FastAPI, Request
import requests
import os
from datetime import datetime, timedelta
from typing import Dict
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

STRAVA_CLIENT_ID = os.getenv("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.getenv("STRAVA_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/exchange_token"
STRAVA_BASE = "https://www.strava.com/api/v3"

tokens = {}  # in-memory store; replace with a DB later


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

    completion = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return {"summary": summary, "suggestions": completion.choices[0].message.content}
