import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerSupportApi } from './customer-support';
import type { FAQ, CustomerSupportAgentData, UploadedDocument } from './customer-support.types';

// Get customer support agent configuration
export const useCustomerSupportAgent = (orgId?: number, enabled?: boolean) =>
  useQuery({
    queryKey: ['customer-support-agent', String(orgId ?? '')],
    queryFn: () => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.getAgent(orgId);
    },
    enabled: enabled ?? !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

// Update FAQs
export const useUpdateFAQs = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faqs: FAQ[]) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.updateFAQs(orgId, faqs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Update agent name
export const useUpdateAgentName = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent_name: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.updateAgentName(orgId, agent_name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Update voice
export const useUpdateVoice = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voice: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.updateVoice(orgId, voice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Update language
export const useUpdateLanguage = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.updateLanguage(orgId, language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Update instructions
export const useUpdateInstructions = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agent_instructions, human_transfer_criteria }: { agent_instructions: string; human_transfer_criteria: string }) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.updateInstructions(orgId, agent_instructions, human_transfer_criteria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Upload document
export const useUploadDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File): Promise<UploadedDocument> => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.uploadDocument(orgId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

// Delete document
export const useDeleteDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return customerSupportApi.deleteDocument(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customer-support-agent', String(orgId ?? '')]
      });
    },
  });
};

