export interface Activity {
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

export interface ActivitiesResponse {
  success: boolean;
  message: string;
  data: {
    total_activities: number;
    performance_activities: number;
    activities: Activity[];
  };
}

export interface WorkoutDay {
  date: string;
  workout: string;
  distance?: string | number;
  time?: string;
  pace?: string;
  notes: string;
}

export interface ScheduleData {
  week_of?: string;
  workouts?: WorkoutDay[];
}

export interface RecommendationResponse {
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

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    auth_url: string;
  };
}

export interface TokenStatus {
  success: boolean;
  data: {
    status: string;
    is_expired?: boolean;
    time_until_expiry?: number;
    athlete_id?: number;
  };
}
