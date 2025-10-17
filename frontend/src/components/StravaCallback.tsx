import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Link as MuiLink
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { commonStyles, themeTokens } from '../theme';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


const StravaCallback: React.FC = () => {
  const [status, setStatus] = useState<string>('Processing...');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            setIsLoading(false);
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            setError(data.message || 'Failed to connect to Strava');
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error exchanging token:', error);
          setError('Error connecting to server');
          setIsLoading(false);
        }
      } else {
        setError('No authorization code received');
        setIsLoading(false);
      }
    };

    handleCallback();
  }, []);

  return (
    <Container maxWidth="md" sx={commonStyles.containerWithNav}>
      <Card sx={commonStyles.card}>
        <CardContent sx={{ textAlign: 'center', p: 6 }}>
          {isLoading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={3}
            >
              <CircularProgress 
                size={60} 
                sx={{ color: themeTokens.colors.text.primary }} 
              />
              <Typography variant="h5" color="text.primary" fontWeight={600}>
                🔄 Connecting to Strava...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we process your authorization
              </Typography>
            </Box>
          ) : error ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={3}
            >
              <ErrorIcon 
                sx={{ 
                  fontSize: 80, 
                  color: themeTokens.colors.status.error 
                }} 
              />
              <Typography variant="h5" color="text.primary" fontWeight={600}>
                Connection Failed
              </Typography>
              <Alert 
                severity="error" 
                sx={commonStyles.alertError}
              >
                ❌ {error}
              </Alert>
              <Button
                variant="contained"
                startIcon={<BackIcon />}
                component={MuiLink}
                href="/"
                sx={commonStyles.buttonPrimary}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={3}
            >
              <SuccessIcon 
                sx={{ 
                  fontSize: 80, 
                  color: themeTokens.colors.status.success 
                }} 
              />
              <Typography variant="h5" color="text.primary" fontWeight={600}>
                ✅ Successfully Connected!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redirecting you back to the app...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default StravaCallback;
