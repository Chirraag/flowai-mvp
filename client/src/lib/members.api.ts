import { api } from './api';
import type { MembersResponse } from '@/types/members';

export const membersApi = {
  /**
   * Get all members for an organization
   */
  async getMembers(orgId: number): Promise<MembersResponse['data']> {
    const response = await api.get<MembersResponse>(`/api/v1/members/${orgId}/list`);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch members');
    }
    return response.data;
  },
};