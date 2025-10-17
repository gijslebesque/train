# app/data_processor.py
"""
Data processing utilities for Strava activities.
Handles extraction and normalization of performance metrics.
"""

from typing import List, Dict, Any


def extract_performance_stats(activities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Extract only performance-related stats from Strava activities.
    
    Args:
        activities: List of raw Strava activity data
        
    Returns:
        List of filtered activities with only performance metrics
    """
    performance_stats = []
    
    for activity in activities:
        # Include activities that have either distance+time OR just time (for strength training)
        has_distance_time = activity.get("distance") and activity.get("moving_time")
        has_time_only = activity.get("moving_time") and not activity.get("distance")
        
        if has_distance_time or has_time_only:
            sport_type = activity.get("sport_type", "").lower()
            
            stats = {
                "id": activity.get("id"),
                "name": activity.get("name"),
                "type": activity.get("type"),
                "sport_type": activity.get("sport_type"),
                "start_date": activity.get("start_date"),
                "start_date_local": activity.get("start_date_local"),
                
                # Performance metrics
                "distance": activity.get("distance"),  # meters (None for strength training)
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
            
            # Calculate derived metrics based on activity type
            if stats["moving_time"]:
                stats["moving_time_minutes"] = round(stats["moving_time"] / 60, 2)
            
            # Distance-based metrics (only for activities with distance)
            if stats["distance"]:
                stats["distance_km"] = round(stats["distance"] / 1000, 2)
                stats["average_speed_kmh"] = round(stats["average_speed"] * 3.6, 2) if stats["average_speed"] else None
                stats["max_speed_kmh"] = round(stats["max_speed"] * 3.6, 2) if stats["max_speed"] else None
                stats["pace_per_km"] = round(stats["moving_time"] / (stats["distance"] / 1000), 2) if stats["distance"] > 0 else None
            else:
                # For strength training and other non-distance activities
                stats["distance_km"] = 0
                stats["average_speed_kmh"] = None
                stats["max_speed_kmh"] = None
                stats["pace_per_km"] = None
            
            performance_stats.append(stats)
    
    return performance_stats


def calculate_performance_metrics(activities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate comprehensive performance metrics from filtered activities.
    
    Args:
        activities: List of filtered activity data with performance metrics
        
    Returns:
        Dictionary containing calculated performance metrics
    """
    if not activities:
        return {}
    
    # Calculate totals and averages
    total_distance_km = sum(a["distance_km"] for a in activities if a["distance_km"] is not None)
    total_time_minutes = sum(a["moving_time_minutes"] for a in activities)
    
    # Calculate average speed (only for activities with speed data)
    speed_activities = [a for a in activities if a["average_speed_kmh"]]
    avg_speed_kmh = sum(a["average_speed_kmh"] for a in speed_activities) / len(speed_activities) if speed_activities else 0
    
    # Calculate average heart rate (only for activities with HR data)
    hr_activities = [a for a in activities if a["average_heartrate"]]
    avg_heartrate = sum(a["average_heartrate"] for a in hr_activities) / len(hr_activities) if hr_activities else 0
    
    # Calculate total elevation
    total_elevation = sum(a["total_elevation_gain"] for a in activities if a["total_elevation_gain"] is not None)
    
    # Activity type breakdown
    activity_types = {}
    for activity in activities:
        sport_type = activity.get("sport_type", "Unknown")
        activity_types[sport_type] = activity_types.get(sport_type, 0) + 1
    
    return {
        "total_distance_km": round(total_distance_km, 1),
        "total_time_minutes": round(total_time_minutes, 1),
        "avg_speed_kmh": round(avg_speed_kmh, 1),
        "avg_heartrate": round(avg_heartrate, 0),
        "total_elevation": round(total_elevation, 0),
        "activity_count": len(activities),
        "activity_types": activity_types
    }


def create_performance_summary(activities: List[Dict[str, Any]]) -> str:
    """
    Create a formatted performance summary string.
    
    Args:
        activities: List of filtered activity data
        
    Returns:
        Formatted summary string
    """
    metrics = calculate_performance_metrics(activities)
    
    if not metrics:
        return "No performance data available."
    
    activity_types_str = ', '.join([f'{k}: {v}' for k, v in metrics["activity_types"].items()])
    
    summary = f"""
    Performance Summary (Last {metrics["activity_count"]} activities):
    - Total Distance: {metrics["total_distance_km"]} km
    - Total Time: {metrics["total_time_minutes"]} minutes
    - Average Speed: {metrics["avg_speed_kmh"]} km/h
    - Average Heart Rate: {metrics["avg_heartrate"]} bpm
    - Total Elevation: {metrics["total_elevation"]} m
    - Activity Types: {activity_types_str}
    """
    
    return summary.strip()
