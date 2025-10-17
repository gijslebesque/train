import React from 'react';
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
import { useActivities, useRefreshActivities, getErrorMessage } from '../hooks/api';

const ActivitiesPage: React.FC = () => {
  const { data: activitiesData, isLoading, error, refetch } = useActivities();
  const refreshActivities = useRefreshActivities();

  // Extract data from the response
  const activities = activitiesData?.data?.activities || [];
  const stats = React.useMemo(() => {
    if (!activitiesData?.data) {
      return {
        totalActivities: 0,
        performanceActivities: 0,
        totalDistance: 0,
        totalTime: 0,
        avgSpeed: 0
      };
    }

    const { total_activities, performance_activities, activities: activitiesList } = activitiesData.data;
    return {
      totalActivities: total_activities,
      performanceActivities: performance_activities,
      totalDistance: activitiesList.reduce((sum, activity) => sum + activity.distance_km, 0),
      totalTime: activitiesList.reduce((sum, activity) => sum + activity.moving_time_minutes, 0),
      avgSpeed: activitiesList.length > 0 
        ? activitiesList.reduce((sum, activity) => sum + (activity.average_speed_kmh || 0), 0) / activitiesList.length
        : 0
    };
  }, [activitiesData]);

  const handleRefresh = () => {
    refreshActivities.mutate();
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
          {getErrorMessage(error)}
        </Alert>
        <Button
          variant="contained"
          onClick={() => refetch()}
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
          onClick={handleRefresh}
          color="success"
          disabled={refreshActivities.isPending}
        >
          {refreshActivities.isPending ? 'Refreshing...' : 'Refresh'}
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
