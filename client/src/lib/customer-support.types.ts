export interface FAQ {
  question: string;
  answer: string;
}

export interface CustomerSupportAgentData {
  id: string;
  org_id: number;
  agent_name: string;
  language: string;
  voice: string;
  agent_instructions: string;
  human_transfer_criteria: string;
  faqs: FAQ[];
  documents: UploadedDocument[];
  current_version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

export interface CustomerSupportAgentConfig {
  agent_name: string;
  language: string;
  voice: string;
  agent_instructions: string;
  human_transfer_criteria: string;
}

export interface UpdateFAQsRequest {
  faqs: FAQ[];
}

export interface UpdateAgentNameRequest {
  agent_name: string;
}

export interface UpdateVoiceRequest {
  voice: string;
}

export interface UpdateLanguageRequest {
  language: string;
}

export interface UpdateInstructionsRequest {
  agent_instructions: string;
  human_transfer_criteria: string;
}

export interface UploadedDocument {
  url: string;
  name: string;
  s3_key: string;
  uploaded_at: string;
  uploaded_by: number;
}

export interface UploadDocumentRequest {
  file: File;
}

export interface DeleteDocumentRequest {
  url: string;
}