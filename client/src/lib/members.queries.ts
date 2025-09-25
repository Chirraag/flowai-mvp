import { useQuery } from '@tanstack/react-query';
import { membersApi } from './members.api';

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