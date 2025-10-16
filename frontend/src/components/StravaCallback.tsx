import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


const StravaCallback: React.FC = () => {
  const [status, setStatus] = useState<string>('Processing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      if (code) {
        try {
          const response = await axios.get(`${API_BASE_URL}/exchange_token?code=${code}`);
          const data = response.data;
          
          if (data.success) {
            setStatus('Successfully connected to Strava! Redirecting...');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            setError(data.message || 'Failed to connect to Strava');
          }
        } catch (error) {
          console.error('Error exchanging token:', error);
          setError('Error connecting to server');
        }
      } else {
        setError('No authorization code received');
      }
    };

    handleCallback();
  }, []);

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        {status}
      </h1>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          ❌ {error}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/" style={{ 
          color: '#007bff',
          textDecoration: 'none'
        }}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
};

export default StravaCallback;
