import { api } from '@/lib/api';
import type { AnalyticsData, ApiResponse } from '@/types/analytics';

/**
 * Analytics API Services
 * Uses the centralized HTTP client with authentication and error handling
 */
export const analyticsApi = {
  /**
   * Get analytics data for an organization
   * GET /api/v1/callAnalytics?org_id=${orgId}
   */
  async getAnalytics(orgId: number): Promise<AnalyticsData> {
    try {
      const response: any = await api.get(`/api/v1/callAnalytics?org_id=${orgId}`);

      // API returns { status: true, data: {...} } but our interface expects { success: true, data: {...} }
      if (!response.status || !response.data) {
        throw new Error(response.message || 'Failed to fetch analytics data');
      }

      return response.data;
    } catch (error: any) {
      // Handle specific error types
      if (error.message?.includes('401') || error.message?.includes('403')) {
        // Authentication/authorization error - redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Authentication required. Please log in again.');
      }

      if (error.message?.includes('500') || error.message?.includes('502') || error.message?.includes('503')) {
        // Server error - show retry message
        throw new Error('Server error occurred. Please try again later.');
      }

      if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        // Network error
        throw new Error('Network connection error. Please check your internet connection.');
      }

      // Re-throw the original error if it's already user-friendly
      throw error;
    }
  },
};
