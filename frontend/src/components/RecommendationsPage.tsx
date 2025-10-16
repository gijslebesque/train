import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface RecommendationResponse {
  success: boolean;
  message: string;
  data: {
    summary: string;
    suggestions: string;
    metrics: {
      total_distance_km: number;
      total_time_minutes: number;
      avg_speed_kmh: number;
      avg_heartrate: number;
      total_elevation: number;
      activity_count: number;
      activity_types: Record<string, number>;
    };
    token_usage: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    };
  };
}

const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations`);
      const data: RecommendationResponse = response.data;
      
      if (data.success) {
        setRecommendations(data.data);
      } else {
        setError(data.message || 'Failed to fetch recommendations');
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error connecting to server');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        🤖 Generating AI recommendations...
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
          onClick={fetchRecommendations}
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

  if (!recommendations) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          padding: '1rem',
          borderRadius: '4px'
        }}>
          No recommendations available. Make sure you have activities and are connected to Strava.
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
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
          🤖 AI Training Recommendations
        </h1>
        <button
          onClick={fetchRecommendations}
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

      {/* Performance Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>📊 Performance Summary</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
              {recommendations.metrics.activity_count}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Activities</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {recommendations.metrics.total_distance_km.toFixed(1)} km
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Distance</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
              {formatDuration(recommendations.metrics.total_time_minutes)}
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Time</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {recommendations.metrics.avg_speed_kmh.toFixed(1)} km/h
            </div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>Avg Speed</div>
          </div>
          
          {recommendations.metrics.avg_heartrate > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e83e8c' }}>
                {recommendations.metrics.avg_heartrate} bpm
              </div>
              <div style={{ color: '#666', fontSize: '0.9rem' }}>Avg Heart Rate</div>
            </div>
          )}
        </div>
        
        {/* Activity Types */}
        <div style={{ marginTop: '1rem' }}>
          <strong>Activity Types:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            {Object.entries(recommendations.metrics.activity_types).map(([type, count]) => (
              <span
                key={type}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  margin: '0.25rem 0.25rem 0.25rem 0'
                }}
              >
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '1rem',
          borderBottom: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: 0, color: '#1976d2' }}>
            🤖 AI Training Recommendations
          </h3>
        </div>
        
        <div style={{
          padding: '1.5rem',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap'
        }}>
          {recommendations.suggestions}
        </div>
      </div>

      {/* Token Usage Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#666',
        textAlign: 'center'
      }}>
        <strong>AI Usage:</strong> {recommendations.token_usage.input_tokens} input + {recommendations.token_usage.output_tokens} output = {recommendations.token_usage.total_tokens} total tokens
      </div>
    </div>
  );
};

export default RecommendationsPage;
