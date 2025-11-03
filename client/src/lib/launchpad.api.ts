import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  ApiResponse,
  LaunchpadFetchData,
  UploadDocumentResponse,
  DeleteDocumentResponse,
  CreateCuratedKBResponse,
  DeleteCuratedKBResponse
} from './launchpad.types';
import type {
  UpdateAccountDetailsRequest,
  UpdateLocationsRequest,
  UpdateSpecialtiesRequest,
  UpdateInsuranceRequest,
  UpdateResponse
} from './launchpad.types';

// =============================================================================
// RAW API FUNCTIONS (from original launchpad.ts)
// =============================================================================

export const fetchLaunchpadData = async (orgId: number): Promise<LaunchpadFetchData> => {
  const res = await api.post<ApiResponse<LaunchpadFetchData>>(`/api/v1/launchpad/${orgId}/fetch-data`);

  console.log('fetchLaunchpadData: Raw API response:', res);

  // API returns { success: true, data: {...} } format
  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error('API returned success: false');
  }

  if (!res.data) {
    throw new Error('API response missing data field');
  }

  console.log('fetchLaunchpadData: Extracted data:', res.data);
  return res.data;
};

// Update API functions
export const updateAccountDetails = async (orgId: number, payload: UpdateAccountDetailsRequest): Promise<UpdateResponse> => {
  const res = await api.post<UpdateResponse>(`/api/v1/launchpad/${orgId}/update-account-details`, payload);

  console.log('updateAccountDetails: API response:', res);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Account details update failed');
  }

  return res;
};

export const updateLocations = async (orgId: number, payload: UpdateLocationsRequest): Promise<UpdateResponse> => {
  const res = await api.post<UpdateResponse>(`/api/v1/launchpad/${orgId}/update-locations`, payload);

  console.log('updateLocations: API response:', res);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Locations update failed');
  }

  return res;
};

export const updateSpecialties = async (orgId: number, payload: UpdateSpecialtiesRequest): Promise<UpdateResponse> => {
  const res = await api.post<UpdateResponse>(`/api/v1/launchpad/${orgId}/update-specialties`, payload);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Specialties update failed');
  }

  return res;
};

export const updateInsurance = async (orgId: number, payload: UpdateInsuranceRequest): Promise<UpdateResponse> => {
  const res = await api.post<UpdateResponse>(`/api/v1/launchpad/${orgId}/update-insurance`, payload);

  console.log('updateInsurance: API response:', res);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Insurance update failed');
  }

  return res;
};

// Document upload/delete API functions

// Account Documents
export const uploadAccountDocument = async (orgId: number, file: File): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.upload<UploadDocumentResponse>(`/api/v1/launchpad/${orgId}/account-details/upload-document`, formData);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Account document upload failed');
  }

  return res;
};

export const deleteAccountDocument = async (orgId: number, url: string): Promise<DeleteDocumentResponse> => {
  const res = await api.post<DeleteDocumentResponse>(`/api/v1/launchpad/${orgId}/account-details/delete-document`, { url });

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Account document deletion failed');
  }

  return res;
};

// Locations Documents
export const uploadLocationsDocument = async (orgId: number, file: File): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.upload<UploadDocumentResponse>(`/api/v1/launchpad/${orgId}/locations/upload-document`, formData);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Locations document upload failed');
  }

  return res;
};

export const deleteLocationsDocument = async (orgId: number, url: string): Promise<DeleteDocumentResponse> => {
  const res = await api.post<DeleteDocumentResponse>(`/api/v1/launchpad/${orgId}/locations/delete-document`, { url });

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Locations document deletion failed');
  }

  return res;
};

// Specialties Documents
export const uploadSpecialtiesDocument = async (orgId: number, file: File): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.upload<UploadDocumentResponse>(`/api/v1/launchpad/${orgId}/specialties/upload-document`, formData);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Specialties document upload failed');
  }

  return res;
};

export const deleteSpecialtiesDocument = async (orgId: number, url: string): Promise<DeleteDocumentResponse> => {
  const res = await api.post<DeleteDocumentResponse>(`/api/v1/launchpad/${orgId}/specialties/delete-document`, { url });

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Specialties document deletion failed');
  }

  return res;
};

// Insurance Documents
export const uploadInsuranceDocument = async (orgId: number, file: File): Promise<UploadDocumentResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.upload<UploadDocumentResponse>(`/api/v1/launchpad/${orgId}/insurance/upload-document`, formData);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Insurance document upload failed');
  }

  return res;
};

export const deleteInsuranceDocument = async (orgId: number, url: string): Promise<DeleteDocumentResponse> => {
  const res = await api.post<DeleteDocumentResponse>(`/api/v1/launchpad/${orgId}/insurance/delete-document`, { url });

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Insurance document deletion failed');
  }

  return res;
};

// Curated Knowledge Base API functions
export const createCuratedKB = async (orgId: number): Promise<CreateCuratedKBResponse> => {
  const res = await api.post<CreateCuratedKBResponse>(`/api/v1/launchpad/${orgId}/create-curated-kb`, {});

  console.log('createCuratedKB: API response:', res);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Curated knowledge base creation failed');
  }

  return res;
};

export const deleteCuratedKB = async (orgId: number, url: string): Promise<DeleteCuratedKBResponse> => {
  const res = await api.post<DeleteCuratedKBResponse>(`/api/v1/launchpad/${orgId}/delete-curated-kb`, { url });

  console.log('deleteCuratedKB: API response:', res);

  if (!res || typeof res !== 'object') {
    throw new Error('Invalid API response format');
  }

  if (!res.success) {
    throw new Error(res.message || 'Curated knowledge base deletion failed');
  }

  return res;
};

// =============================================================================
// REACT QUERY HOOKS (from original launchpad.queries.ts)
// =============================================================================

export const useLaunchpadData = (orgId?: number, enabled?: boolean) =>
  useQuery({
    queryKey: ['launchpad', String(orgId ?? '')],
    queryFn: () => {
      if (!orgId) throw new Error('Missing orgId');
      return fetchLaunchpadData(orgId);
    },
    enabled: enabled ?? !!orgId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    // Ensure fresh data on organization switch
    refetchOnMount: true,
  });

// Update mutations with optimized caching
export const useUpdateAccountDetails = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAccountDetailsRequest) => {
      if (!orgId) throw new Error('Missing orgId');
      return updateAccountDetails(orgId, payload);
    },
    onSuccess: () => {
      // Immediate invalidation for account updates (no chaining)
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useUpdateLocations = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLocationsRequest) => {
      if (!orgId) throw new Error('Missing orgId');
      return updateLocations(orgId, payload);
    },
    onSuccess: () => {
      // No immediate invalidation - will be handled by chained flow
      // The handleSaveLocations will invalidate after both locations and specialties are updated
    },
  });
};

export const useUpdateSpecialties = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSpecialtiesRequest) => {
      if (!orgId) throw new Error('Missing orgId');
      return updateSpecialties(orgId, payload);
    },
    onSuccess: () => {
      // Immediate invalidation for standalone specialty updates
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useUpdateInsurance = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInsuranceRequest) => {
      if (!orgId) throw new Error('Missing orgId');
      return updateInsurance(orgId, payload);
    },
    onSuccess: () => {
      // Immediate invalidation for insurance updates
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

// Document upload/delete mutations

// Account Documents
export const useUploadAccountDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      if (!orgId) throw new Error('Missing orgId');
      return uploadAccountDocument(orgId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useDeleteAccountDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return deleteAccountDocument(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

// Locations Documents
export const useUploadLocationsDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      if (!orgId) throw new Error('Missing orgId');
      return uploadLocationsDocument(orgId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useDeleteLocationsDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return deleteLocationsDocument(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

// Specialties Documents
export const useUploadSpecialtiesDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      if (!orgId) throw new Error('Missing orgId');
      return uploadSpecialtiesDocument(orgId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useDeleteSpecialtiesDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return deleteSpecialtiesDocument(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

// Insurance Documents
export const useUploadInsuranceDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      if (!orgId) throw new Error('Missing orgId');
      return uploadInsuranceDocument(orgId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useDeleteInsuranceDocument = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return deleteInsuranceDocument(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

// Curated Knowledge Base mutations
export const useCreateCuratedKB = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!orgId) throw new Error('Missing orgId');
      return createCuratedKB(orgId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};

export const useDeleteCuratedKB = (orgId?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => {
      if (!orgId) throw new Error('Missing orgId');
      return deleteCuratedKB(orgId, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['launchpad', String(orgId ?? '')]
      });
    },
  });
};