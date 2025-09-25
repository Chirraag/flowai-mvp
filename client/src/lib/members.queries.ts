import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from './members.api';
import type { AddMemberRequest } from '@/types/members';

export const useMembers = (orgId?: number, enabled?: boolean) =>
  useQuery({
    queryKey: ['members', String(orgId ?? '')],
    queryFn: () => {
      if (!orgId) throw new Error('Missing orgId');
      return membersApi.getMembers(orgId);
    },
    enabled: enabled ?? !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

export const useAddMember = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberData: AddMemberRequest) => {
      if (!orgId) throw new Error('Missing orgId');
      return membersApi.addMember(orgId, memberData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['members', String(orgId ?? '')]
      });
    },
  });
};