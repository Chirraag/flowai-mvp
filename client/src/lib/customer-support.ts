import { api } from './api';
import type {
  CustomerSupportAgentData,
  FAQ,
  UpdateFAQsRequest,
  UpdateAgentNameRequest,
  UpdateVoiceRequest,
  UpdateLanguageRequest,
  UpdateInstructionsRequest,
  UploadedDocument,
  UploadDocumentRequest,
  DeleteDocumentRequest
} from './customer-support.types';

// API response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Customer Support Agent API functions
export const customerSupportApi = {
  // Get agent configuration
  getAgent: async (orgId: number): Promise<CustomerSupportAgentData> => {
    const response = await api.get<ApiResponse<CustomerSupportAgentData>>(`/api/v1/customer-support-agent/${orgId}`);
    return response.data;
  },

  // Update operations
  updateFAQs: async (orgId: number, faqs: FAQ[]): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/update-faqs`, { faqs } as UpdateFAQsRequest);
    return response.data;
  },

  updateAgentName: async (orgId: number, agent_name: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/update-name`, { agent_name } as UpdateAgentNameRequest);
    return response.data;
  },

  updateVoice: async (orgId: number, voice: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/update-voice`, { voice } as UpdateVoiceRequest);
    return response.data;
  },

  updateLanguage: async (orgId: number, language: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/update-language`, { language } as UpdateLanguageRequest);
    return response.data;
  },

  updateInstructions: async (orgId: number, agent_instructions: string, human_transfer_criteria: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/update-instructions`, { agent_instructions, human_transfer_criteria } as UpdateInstructionsRequest);
    return response.data;
  },

  // Document operations
  uploadDocument: async (orgId: number, file: File): Promise<UploadedDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.upload<ApiResponse<UploadedDocument>>(`/api/v1/customer-support-agent/${orgId}/upload-document`, formData);
    return response.data;
  },

  deleteDocument: async (orgId: number, url: string): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/api/v1/customer-support-agent/${orgId}/delete-document`, { url } as DeleteDocumentRequest);
    return response.data;
  },

};
