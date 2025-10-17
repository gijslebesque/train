import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack
} from '@mui/material';
import {
  DirectionsRun as RunIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  DirectionsWalk as WalkIcon,
  Hiking as HikeIcon,
  FitnessCenter as StrengthIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Terrain as ElevationIcon,
  EmojiEvents as AchievementIcon
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    } catch (error: unknown) {
      console.error('Error fetching activities:', error);
      if (error instanceof AxiosError && error.response?.data?.message as string) {
        setError((error.response?.data?.message as string));
      }
      else {
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
      case 'ride': return <BikeIcon />;
      case 'run': return <RunIcon />;
      case 'swim': return <SwimIcon />;
      case 'walk': return <WalkIcon />;
      case 'hike': return <HikeIcon />;
      case 'weighttraining': return <StrengthIcon />;
      case 'strength': return <StrengthIcon />;
      case 'weightlifting': return <StrengthIcon />;
      default: return <RunIcon />;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: '80px', mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={40} />
            <Typography variant="h6" color="text.secondary">
              Loading activities...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: '80px', mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchActivities}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: '80px', mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" color="primary">
          🏃‍♂️ My Activities
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchActivities}
          color="success"
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {stats.totalActivities}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {stats.totalDistance.toFixed(1)} km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Distance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {formatDuration(stats.totalTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" fontWeight="bold">
                {stats.avgSpeed.toFixed(1)} km/h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Speed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activities List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activities ({activities.length})
          </Typography>
          
          {activities.length === 0 ? (
            <Alert severity="info">
              No activities found. Make sure you're connected to Strava.
            </Alert>
          ) : (
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {getSportIcon(activity.sport_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" component="span">
                            {activity.name}
                          </Typography>
                          <Box>
                            {activity.achievement_count > 0 && (
                              <Chip
                                icon={<AchievementIcon />}
                                label={`${activity.achievement_count} achievements`}
                                color="warning"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                            )}
                            {activity.pr_count > 0 && (
                              <Chip
                                label={`${activity.pr_count} PRs`}
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {formatDate(activity.start_date_local)} • {activity.sport_type}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap">
                            <Chip
                              icon={<SpeedIcon />}
                              label={`${activity.distance_km.toFixed(2)} km`}
                              variant="outlined"
                              size="small"
                            />
                            <Chip
                              icon={<TimerIcon />}
                              label={formatDuration(activity.moving_time_minutes)}
                              variant="outlined"
                              size="small"
                            />
                            {activity.average_speed_kmh && (
                              <Chip
                                icon={<SpeedIcon />}
                                label={`${activity.average_speed_kmh.toFixed(1)} km/h`}
                                variant="outlined"
                                size="small"
                              />
                            )}
                            {activity.total_elevation_gain > 0 && (
                              <Chip
                                icon={<ElevationIcon />}
                                label={`${activity.total_elevation_gain} m`}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Stack>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ActivitiesPage;
