import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  Favorite as HeartIcon,
  DirectionsRun as RunIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface WorkoutDay {
  date: string;
  workout: string;
  distance?: string | number;
  time?: string;
  pace?: string;
  notes: string;
}

interface ScheduleData {
  week_of?: string;
  workouts?: WorkoutDay[];
}

interface RecommendationResponse {
  success: boolean;
  message: string;
  data: {
    summary: string;
    recommendations: string;
    schedule?: ScheduleData;
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

  console.log('schedule',recommendations?.schedule)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getDay()];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          gap={3}
        >
          <CircularProgress size={60} sx={{ color: '#ffffff' }} />
          <Typography variant="h6" color="text.secondary" textAlign="center">
            🤖 Generating AI recommendations...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box textAlign="center">
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: '#1a1a1a',
              border: '1px solid #ff4444',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#ff4444'
              }
            }}
          >
            ❌ {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchRecommendations}
            startIcon={<RefreshIcon />}
            size="large"
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#f0f0f0',
              }
            }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  if (!recommendations) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box textAlign="center">
          <Alert 
            severity="info"
            sx={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              color: '#ffffff',
              '& .MuiAlert-icon': {
                color: '#2196f3'
              }
            }}
          >
            No recommendations available. Make sure you have activities and are connected to Strava.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
        pb={3}
        borderBottom="1px solid"
        borderColor="divider"
      >
        <Typography variant="h4" component="h1" color="primary" fontWeight={700}>
          <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Training Recommendations
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchRecommendations}
          startIcon={<RefreshIcon />}
          sx={{
            borderColor: '#333333',
            color: '#ffffff',
            '&:hover': {
              borderColor: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Performance Summary */}
      <Card sx={{ mb: 6, backgroundColor: '#111111', border: '1px solid #333333' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary" fontWeight={600} sx={{ mb: 3 }}>
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Performance Summary
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {recommendations.metrics.activity_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <RunIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                  Activities
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {recommendations.metrics.total_distance_km.toFixed(1)} km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Distance
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatDuration(recommendations.metrics.total_time_minutes)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <TimerIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                  Total Time
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {recommendations.metrics.avg_speed_kmh.toFixed(1)} km/h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <SpeedIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                  Avg Speed
                </Typography>
              </Box>
            </Grid>
            
            {recommendations.metrics.avg_heartrate > 0 && (
              <Grid item xs={6} sm={4} md={2.4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {recommendations.metrics.avg_heartrate} bpm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <HeartIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: '1rem' }} />
                    Avg Heart Rate
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Activity Types */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
              Activity Types:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Object.entries(recommendations.metrics.activity_types).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  size="small"
                  sx={{
                    backgroundColor: '#333333',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#444444',
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {/* <Card sx={{ mb: 4, boxShadow: 3 }}>
        <Box
          sx={{
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h5" component="h3" fontWeight="bold">
            <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Training Recommendations
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              fontSize: '1.1rem'
            }}
          >
            {recommendations.recommendations}
          </Typography>
        </CardContent>
      </Card> */}

      {/* Weekly Schedule Table */}
      {recommendations.schedule && recommendations.schedule.workouts && (
        <Card sx={{ mb: 6, backgroundColor: '#111111', border: '1px solid #333333' }}>
          <Box
            sx={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              p: 3,
              borderBottom: '1px solid #333333'
            }}
          >
            <Typography variant="h5" component="h3" fontWeight={600}>
              📅 Weekly Training Schedule
            </Typography>
            {recommendations.schedule.week_of && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Week of: {recommendations.schedule.week_of}
              </Typography>
            )}
          </Box>
          
          <TableContainer sx={{ backgroundColor: '#111111' }}>
            <Table sx={{ minWidth: 650 }} aria-label="weekly schedule table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#1a1a1a' }}>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Day</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Workout</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Distance</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Pace</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.schedule.workouts.map((workout, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '#0a0a0a' : '#111111',
                      '&:hover': {
                        backgroundColor: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '#151515' : '#1a1a1a',
                      }
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="primary">
                          {getWeekday(workout.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(workout.date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={workout.workout}
                        size="small"
                        sx={{
                          backgroundColor: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '#333333' : '#ffffff',
                          color: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '#ffffff' : '#000000',
                          border: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '1px solid #555555' : 'none',
                          '&:hover': {
                            backgroundColor: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? '#444444' : '#f0f0f0',
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {workout.distance ? `${workout.distance}${typeof workout.distance === 'number' ? ' km' : ''}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {workout.time || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {workout.pace || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {workout.notes}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Token Usage Info */}
      <Card
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>AI Usage:</strong> {recommendations.token_usage.input_tokens} input + {recommendations.token_usage.output_tokens} output = {recommendations.token_usage.total_tokens} total tokens
        </Typography>
      </Card>
    </Container>
  );
};

export default RecommendationsPage;
