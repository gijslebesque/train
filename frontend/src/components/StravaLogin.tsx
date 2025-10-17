import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  DirectionsRun as StravaIcon,
  Logout as LogoutIcon,
  Visibility as ViewActivitiesIcon,
  Psychology as RecommendationsIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Card sx={{ p: 6, backgroundColor: '#111111' }}>
        <Box textAlign="center" mb={6}>
          <Box sx={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            backgroundColor: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mx: 'auto',
            mb: 4
          }}>
            <StravaIcon sx={{ fontSize: 60, color: '#000000' }} />
          </Box>
          <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight={700}>
            SPORTY
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            AI-Powered Training Recommendations
          </Typography>
        </Box>

        {tokenStatus?.data.status === 'tokens_available' ? (
          <Card sx={{ mb: 4, backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
            <CardContent>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333333',
                  color: '#ffffff',
                  '& .MuiAlert-icon': {
                    color: '#4caf50'
                  }
                }}
              >
                <Typography variant="h6" gutterBottom>
                  ✅ Connected to Strava!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Athlete ID: {tokenStatus.data.athlete_id}
                </Typography>
                {tokenStatus.data.is_expired ? (
                  <Chip 
                    label="Token expired" 
                    sx={{ 
                      mt: 1, 
                      backgroundColor: '#ff4444',
                      color: '#ffffff'
                    }} 
                    size="small" 
                  />
                ) : (
                  <Chip 
                    label={`Expires in: ${Math.floor((tokenStatus.data.time_until_expiry || 0) / 3600)} hours`} 
                    sx={{ 
                      mt: 1,
                      backgroundColor: '#333333',
                      color: '#ffffff'
                    }} 
                    size="small" 
                  />
                )}
              </Alert>
              
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ViewActivitiesIcon />}
                    onClick={() => navigate('/activities')}
                    sx={{ 
                      flex: 1,
                      borderColor: '#333333',
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }
                    }}
                  >
                    View Activities
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<RecommendationsIcon />}
                    onClick={() => navigate('/recommendations')}
                    sx={{ 
                      flex: 1,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                      }
                    }}
                  >
                    Get Recommendations
                  </Button>
                </Stack>
                
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  fullWidth
                  sx={{ 
                    borderColor: '#333333',
                    color: '#b0b0b0',
                    '&:hover': {
                      borderColor: '#ffffff',
                      color: '#ffffff',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  Logout from Strava
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
            <CardContent>
              <Typography variant="body1" color="text.secondary" paragraph textAlign="center" sx={{ mb: 4 }}>
                Connect your Strava account to get AI-powered training recommendations based on your activities.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<StravaIcon />}
                onClick={handleLogin}
                disabled={isLoading}
                fullWidth
                sx={{ 
                  py: 2,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                  '&:disabled': {
                    backgroundColor: '#333333',
                    color: '#666666',
                  }
                }}
              >
                {isLoading ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    Connecting...
                  </Box>
                ) : (
                  'Login with Strava'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            After clicking login, you'll be redirected to Strava to authorize the application.
            Once authorized, you'll be redirected back to this page.
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default StravaLogin;
