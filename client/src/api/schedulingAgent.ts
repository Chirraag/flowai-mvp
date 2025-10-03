import { api } from '@/lib/api';
import type {
  SchedulingAgent,
  ApiResponse,
  UpdateAppointmentSetupPayload,
  UpdatePatientEligibilityPayload,
  UpdateSchedulingPoliciesPayload,
  UpdateProviderPreferencesPayload,
  UpdateResponse,
} from '@/types/schedulingAgent';

/**
 * Scheduling Agent API Services
 * Uses the centralized HTTP client with authentication and error handling
 */

export const schedulingAgentApi = {
  /**
   * Get scheduling agent configuration
   */
  async getSchedulingAgent(id: string): Promise<SchedulingAgent> {
    const response: ApiResponse<SchedulingAgent> = await api.get(`/api/v1/scheduling-agent/${id}`);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch scheduling agent');
    }
    return response.data;
  },

  /**
   * Update appointment setup configuration
   */
  async updateAppointmentSetup(id: string, payload: UpdateAppointmentSetupPayload): Promise<UpdateResponse> {
    const response: ApiResponse<UpdateResponse> = await api.put(
      `/api/v1/scheduling-agent/${id}/appointment-setup`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update appointment setup');
    }
    return response.data;
  },

  /**
   * Update patient eligibility configuration
   */
  async updatePatientEligibility(id: string, payload: UpdatePatientEligibilityPayload): Promise<UpdateResponse> {
    const response: ApiResponse<UpdateResponse> = await api.put(
      `/api/v1/scheduling-agent/${id}/patient-eligibility`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update patient eligibility');
    }
    return response.data;
  },

  /**
   * Update scheduling policies configuration
   */
  async updateSchedulingPolicies(id: string, payload: UpdateSchedulingPoliciesPayload): Promise<UpdateResponse> {
    const response: ApiResponse<UpdateResponse> = await api.put(
      `/api/v1/scheduling-agent/${id}/scheduling-policies`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update scheduling policies');
    }
    return response.data;
  },

  /**
   * Update provider preferences configuration
   */
  async updateProviderPreferences(id: string, payload: UpdateProviderPreferencesPayload): Promise<UpdateResponse> {
    const response: ApiResponse<UpdateResponse> = await api.put(
      `/api/v1/scheduling-agent/${id}/provider-preferences`,
      payload
    );
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update provider preferences');
    }
    return response.data;
  },
};
