import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import type { 
  ActivitiesResponse, 
  RecommendationResponse, 
  AuthResponse, 
  TokenStatus 
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Query Keys
export const queryKeys = {
  activities: ['activities'] as const,
  recommendations: ['recommendations'] as const,
  tokenStatus: ['tokenStatus'] as const,
};

// Activities Hook
export const useActivities = () => {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: async (): Promise<ActivitiesResponse> => {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for activities
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

// Recommendations Hook
export const useRecommendations = () => {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: async (): Promise<RecommendationResponse> => {
      const response = await axios.get(`${API_BASE_URL}/recommendations`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for recommendations (AI generated)
    gcTime: 30 * 60 * 1000, // 30 minutes cache
  });
};

// Token Status Hook
export const useTokenStatus = () => {
  return useQuery({
    queryKey: queryKeys.tokenStatus,
    queryFn: async (): Promise<TokenStatus> => {
      const response = await axios.get(`${API_BASE_URL}/token_status`);
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for token status
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Auth URL Hook (mutation)
export const useAuthUrl = () => {
  return useMutation({
    mutationFn: async (): Promise<AuthResponse> => {
      const response = await axios.get(`${API_BASE_URL}/auth/strava`);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.data.auth_url) {
        window.location.href = data.data.auth_url;
      }
    },
  });
};

// Refresh Activities Hook (mutation)
export const useRefreshActivities = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<ActivitiesResponse> => {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch activities
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
    },
  });
};

// Refresh Recommendations Hook (mutation)
export const useRefreshRecommendations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<RecommendationResponse> => {
      const response = await axios.get(`${API_BASE_URL}/recommendations`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch recommendations
      queryClient.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
};

// Utility function to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};
