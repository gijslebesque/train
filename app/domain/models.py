# app/domain/models.py
"""
Domain models for the Sporty application.
Contains core business entities and value objects.
"""

from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class StravaTokens:
    """Represents Strava OAuth tokens."""
    access_token: str
    refresh_token: str
    expires_at: int
    athlete_id: Optional[int] = None
    
    def is_expired(self) -> bool:
        """Check if the access token is expired."""
        if not self.expires_at:
            return True
        return datetime.now().timestamp() > self.expires_at
    
    def time_until_expiry(self) -> int:
        """Get seconds until token expires."""
        if not self.expires_at:
            return 0
        return max(0, int(self.expires_at - datetime.now().timestamp()))


@dataclass
class Activity:
    """Represents a Strava activity with performance metrics."""
    id: int
    name: str
    type: str
    sport_type: str
    start_date: str
    start_date_local: str
    
    # Performance metrics
    distance: int  # meters
    moving_time: int  # seconds
    elapsed_time: int  # seconds
    total_elevation_gain: int  # meters
    average_speed: Optional[float] = None  # m/s
    max_speed: Optional[float] = None  # m/s
    
    # Heart rate data
    has_heartrate: bool = False
    average_heartrate: Optional[int] = None
    max_heartrate: Optional[int] = None
    
    # Elevation data
    elev_high: Optional[int] = None
    elev_low: Optional[int] = None
    
    # Additional metrics
    achievement_count: int = 0
    pr_count: int = 0
    
    # Derived metrics (calculated)
    distance_km: Optional[float] = None
    moving_time_minutes: Optional[float] = None
    average_speed_kmh: Optional[float] = None
    max_speed_kmh: Optional[float] = None
    pace_per_km: Optional[float] = None


@dataclass
class PerformanceMetrics:
    """Aggregated performance metrics across multiple activities."""
    total_distance_km: float
    total_time_minutes: float
    avg_speed_kmh: float
    avg_heartrate: float
    total_elevation: float
    activity_count: int
    activity_types: dict
