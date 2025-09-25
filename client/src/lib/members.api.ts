import { api } from './api';
import type { MembersResponse, AddMemberRequest, AddMemberResponse } from '@/types/members';

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

  /**
   * Add a new member to the organization
   */
  async addMember(orgId: number, memberData: AddMemberRequest): Promise<AddMemberResponse['data']> {
    const response = await api.post<AddMemberResponse>(`/api/v1/members/${orgId}/add`, memberData);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to add member');
    }
    return response.data;
  },
};