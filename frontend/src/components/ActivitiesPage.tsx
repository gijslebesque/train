import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface Activity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  distance: number;
  distance_km: number;
  moving_time: number;
  moving_time_minutes: number;
  average_speed: number;
  average_speed_kmh: number;
  max_speed: number;
  max_speed_kmh: number;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  pace_per_km?: number;
  achievement_count: number;
  pr_count: number;
}

interface ActivitiesResponse {
  success: boolean;
  message: string;
  data: {
    total_activities: number;
    performance_activities: number;
    activities: Activity[];
  };
}

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActivities: 0,
    performanceActivities: 0,
    totalDistance: 0,
    totalTime: 0,
    avgSpeed: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      const data: ActivitiesResponse = response.data;
      
      if (data.success) {
        setActivities(data.data.activities);
        setStats({
          totalActivities: data.data.total_activities,
          performanceActivities: data.data.performance_activities,
          totalDistance: data.data.activities.reduce((sum, activity) => sum + activity.distance_km, 0),
          totalTime: data.data.activities.reduce((sum, activity) => sum + activity.moving_time_minutes, 0),
          avgSpeed: data.data.activities.length > 0 
            ? data.data.activities.reduce((sum, activity) => sum + (activity.average_speed_kmh || 0), 0) / data.data.activities.length
            : 0
        });
      } else {
        setError(data.message || 'Failed to fetch activities');
      }
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getSportIcon = (sportType: string) => {
    switch (sportType.toLowerCase()) {
      case 'ride': return '🚴‍♂️';
      case 'run': return '🏃‍♂️';
      case 'swim': return '🏊‍♂️';
      case 'walk': return '🚶‍♂️';
      case 'hike': return '🥾';
      default: return '🏃‍♂️';
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading activities...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
        <button
          onClick={fetchActivities}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: '120px',
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h1 style={{ color: '#333', margin: 0 }}>
          🏃‍♂️ My Activities
        </h1>
        <button
          onClick={fetchActivities}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {stats.totalActivities}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Activities</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {stats.totalDistance.toFixed(1)} km
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Distance</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
            {formatDuration(stats.totalTime)}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Time</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
            {stats.avgSpeed.toFixed(1)} km/h
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Avg Speed</div>
        </div>
      </div>

      {/* Activities List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderBottom: '1px solid #e9ecef',
          fontWeight: 'bold',
          color: '#333'
        }}>
          Recent Activities ({activities.length})
        </div>
        
        {activities.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666'
          }}>
            No activities found. Make sure you're connected to Strava.
          </div>
        ) : (
          <div>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  padding: '1rem',
                  borderBottom: index < activities.length - 1 ? '1px solid #e9ecef' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                      {getSportIcon(activity.sport_type)}
                    </span>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.1rem',
                      color: '#333'
                    }}>
                      {activity.name}
                    </h3>
                  </div>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    {formatDate(activity.start_date_local)} • {activity.sport_type}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <span>📏 {activity.distance_km.toFixed(2)} km</span>
                    <span>⏱️ {formatDuration(activity.moving_time_minutes)}</span>
                    {activity.average_speed_kmh && (
                      <span>🏃‍♂️ {activity.average_speed_kmh.toFixed(1)} km/h</span>
                    )}
                    {activity.total_elevation_gain > 0 && (
                      <span>⛰️ {activity.total_elevation_gain} m</span>
                    )}
                  </div>
                </div>
                
                <div style={{
                  textAlign: 'right',
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  {activity.achievement_count > 0 && (
                    <div style={{ color: '#ffc107' }}>
                      🏆 {activity.achievement_count} achievements
                    </div>
                  )}
                  {activity.pr_count > 0 && (
                    <div style={{ color: '#28a745' }}>
                      🎯 {activity.pr_count} PRs
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesPage;
