import { api } from '@/lib/api';
import type { AnalyticsData, ApiResponse, AgentListResponse } from '@/types/analytics';

/**
 * Analytics API Services
 * Uses the centralized HTTP client with authentication and error handling
 */
export const analyticsApi = {
  /**
   * Get analytics data for an organization with optional date and agent filtering
   * GET /api/v1/callAnalytics?org_id=${orgId}&from=${from}&to=${to}&agent_name=${agentName}
   */
  async getAnalytics(orgId: number, filters?: {from?: string, to?: string, agentName?: string}): Promise<AnalyticsData> {
    try {
      // Build query string dynamically
      const params = new URLSearchParams();
      params.append('org_id', orgId.toString());

      if (filters?.from) {
        params.append('from', filters.from);
      }
      if (filters?.to) {
        params.append('to', filters.to);
      }
      if (filters?.agentName && filters.agentName.trim()) {
        params.append('agent_name', filters.agentName.trim());
      }

      const queryString = params.toString();
      const endpoint = `/api/v1/callAnalytics?${queryString}`;

      const response: any = await api.get(endpoint);

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

  /**
   * Get list of agents for an organization
   * POST /api/v1/list-agent
   */
  async listAgents(orgId: number): Promise<string[]> {
    try {
      const response: AgentListResponse = await api.post('/api/v1/list-agent', {
        org_id: orgId.toString()
      });

      if (!response.status || !response.data) {
        throw new Error('Failed to fetch agent list');
      }

      // Extract agent names from the response
      return response.data.map(item => item.agent_name);
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
        // Server error
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
