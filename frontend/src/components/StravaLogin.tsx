import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    auth_url: string;
  };
}

interface TokenStatus {
  success: boolean;
  data: {
    status: string;
    is_expired?: boolean;
    time_until_expiry?: number;
    athlete_id?: number;
  };
}

const StravaLogin: React.FC = () => {
  const navigate = useNavigate();
  const [_, setAuthUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/token_status`);
      setTokenStatus(response.data);
    } catch (error) {
      console.error('Error checking token status:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
        console.log('handleLogin', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/auth/strava`);
      const data: AuthResponse = response.data;
      console.log(data);
      
      if (data.success && data.data.auth_url) {
        setAuthUrl(data.data.auth_url);
        // Redirect to Strava authorization
        window.location.href = data.data.auth_url;
      } else {
        alert('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
      alert('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear tokens (you might want to add a logout endpoint to your API)
      setTokenStatus(null);
      alert('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333',
        marginBottom: '2rem'
      }}>
        🚴‍♂️ Sporty - Strava Login
      </h1>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {tokenStatus?.data.status === 'tokens_available' ? (
          <div>
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}>
              ✅ <strong>Connected to Strava!</strong>
              <br />
              Athlete ID: {tokenStatus.data.athlete_id}
              <br />
              {tokenStatus.data.is_expired ? (
                <span style={{ color: '#dc3545' }}>Token expired</span>
              ) : (
                <span style={{ color: '#28a745' }}>
                  Expires in: {Math.floor((tokenStatus.data.time_until_expiry || 0) / 3600)} hours
                </span>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                marginBottom: '1rem'
              }}
            >
              Logout from Strava
            </button>
            
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={() => navigate('/activities')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  flex: 1
                }}
              >
                View Activities
              </button>
              
              <button
                onClick={() => navigate('/recommendations')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  flex: 1
                }}
              >
                Get Recommendations
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ 
              marginBottom: '1.5rem',
              color: '#666',
              textAlign: 'center'
            }}>
              Connect your Strava account to get AI-powered training recommendations based on your activities.
            </p>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#6c757d' : '#fc4c3',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Connecting...' : '🚴‍♂️ Login with Strava'}
            </button>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>
          After clicking login, you'll be redirected to Strava to authorize the application.
          Once authorized, you'll be redirected back to this page.
        </p>
      </div>
    </div>
  );
};

export default StravaLogin;
