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

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="50vh"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
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
          <Alert severity="error" sx={{ mb: 2 }}>
            ❌ {error}
          </Alert>
          <Button
            variant="contained"
            onClick={fetchRecommendations}
            startIcon={<RefreshIcon />}
            size="large"
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
          <Alert severity="info">
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
        mb={4}
        pb={2}
        borderBottom="2px solid"
        borderColor="divider"
      >
        <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
          <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Training Recommendations
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={fetchRecommendations}
          startIcon={<RefreshIcon />}
        >
          Refresh
        </Button>
      </Box>

      {/* Performance Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
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
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {recommendations.metrics.total_distance_km.toFixed(1)} km
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Distance
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2.4}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main" fontWeight="bold">
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
                <Typography variant="h4" color="error.main" fontWeight="bold">
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
                  <Typography variant="h4" color="secondary" fontWeight="bold">
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Activity Types:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Object.entries(recommendations.metrics.activity_types).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  color="primary"
                  size="small"
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
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <Box
            sx={{
              backgroundColor: 'success.light',
              color: 'success.contrastText',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" component="h3" fontWeight="bold">
              📅 Weekly Training Schedule
            </Typography>
            {recommendations.schedule.week_of && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                Week of: {recommendations.schedule.week_of}
              </Typography>
            )}
          </Box>
          
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="weekly schedule table">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Workout</strong></TableCell>
                  <TableCell><strong>Distance</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Pace</strong></TableCell>
                  <TableCell><strong>Notes</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recommendations.schedule.workouts.map((workout, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      backgroundColor: workout.workout === 'Rest' || workout.workout === 'Rest Day' ? 'grey.50' : 'white'
                    }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {workout.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={workout.workout}
                        color={workout.workout === 'Rest' || workout.workout === 'Rest Day' ? 'default' : 'primary'}
                        size="small"
                        variant={workout.workout === 'Rest' || workout.workout === 'Rest Day' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workout.distance ? `${workout.distance}${typeof workout.distance === 'number' ? ' km' : ''}` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workout.time || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
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
      <Paper
        elevation={1}
        sx={{
          p: 2,
          textAlign: 'center',
          backgroundColor: 'grey.50'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          <strong>AI Usage:</strong> {recommendations.token_usage.input_tokens} input + {recommendations.token_usage.output_tokens} output = {recommendations.token_usage.total_tokens} total tokens
        </Typography>
      </Paper>
    </Container>
  );
};

export default RecommendationsPage;
