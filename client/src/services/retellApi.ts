import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

const RETELL_API_BASE_URL = 'https://flowai-backend.replit.app';

interface RetellAgent {
  agent_id: string;
  user_id: string;
  type: string;
  status: string; // 'available' or 'active'
}

interface RetellAgentDetails {
  agent_id: string;
  channel: string;
  last_modification_timestamp: number;
  agent_name: string;
  response_engine: {
    type: string;
    version: number;
    conversation_flow_id: string;
  };
  webhook_url: string;
  language: string;
  opt_out_sensitive_data_storage: boolean;
  opt_in_signed_url: boolean;
  post_call_analysis_data: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  version: number;
  is_published: boolean;
  post_call_analysis_model: string;
  voice_id: string;
  max_call_duration_ms: number;
  interruption_sensitivity: number;
  pronunciation_dictionary: Array<{
    word: string;
    alphabet: string;
    phoneme: string;
  }>;
  allow_user_dtmf: boolean;
  user_dtmf_options: any;
  global_prompt: string;
  model: string;
  knowledge_bases: Array<{
    knowledge_base_id: string;
    knowledge_base_name: string;
    knowledge_base_sources: Array<{
      source_id: string;
      file_url: string;
      filename: string;
      type: string;
      file_size: number;
    }>;
    auto_crawling_paths: any[];
    enable_auto_refresh: boolean;
    status: string;
    error_messages: any[];
    user_modified_timestamp: number;
  }>;
}

interface RetellApiResponse<T> {
  success: boolean;
  data: {
    data: T;
  };
}

async function fetchWithRetellApi(endpoint: string, options?: RequestInit) {
  const url = `${RETELL_API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: 'POST',
    ...options,
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

export function useRetellAgentsList(options?: UseQueryOptions<RetellAgent[]>) {
  return useQuery<RetellAgent[]>({
    queryKey: ['retell-agents-list'],
    queryFn: async () => {
      const response: RetellApiResponse<RetellAgent[]> = await fetchWithRetellApi('/api/v1/retell/agent/list', {
        body: JSON.stringify({}),
      });
      return response.data.data;
    },
    ...options,
  });
}

export function useRetellAgentDetails(agentId: string | undefined, options?: UseQueryOptions<RetellAgentDetails>) {
  return useQuery<RetellAgentDetails>({
    queryKey: ['retell-agent-details', agentId],
    queryFn: async () => {
      const response: { success: boolean; data: RetellAgentDetails } = await fetchWithRetellApi('/api/v1/retell/agent/get', {
        body: JSON.stringify({ agent_id: agentId }),
      });
      return response.data;
    },
    enabled: !!agentId,
    ...options,
  });
}

export function useUpdateRetellAgent(options?: UseMutationOptions<any, Error, { agent_id: string; data: any }>) {
  return useMutation({
    mutationFn: ({ agent_id, data }) =>
      fetchWithRetellApi('/api/v1/retell/agent/update', {
        method: 'POST',
        body: JSON.stringify({ agent_id, ...data }),
      }),
    ...options,
  });
}

export function useUpdateAgentStatus(options?: UseMutationOptions<RetellApiResponse<RetellAgent[]>, Error, { agent_id: string; status: string }>) {
  return useMutation({
    mutationFn: ({ agent_id, status }) =>
      fetchWithRetellApi('/api/v1/retell/agent/update-status', {
        body: JSON.stringify({ agent_id, status }),
      }),
    ...options,
  });
}

interface RetellVoice {
  voice_id: string;
  voice_type: string;
  standard_voice_type: string;
  voice_name: string;
  provider: string;
  accent: string;
  gender: string;
  age: string;
  avatar_url: string;
  preview_audio_url: string;
}

export function useRetellVoicesList(options?: UseQueryOptions<RetellVoice[]>) {
  return useQuery<RetellVoice[]>({
    queryKey: ['retell-voices-list'],
    queryFn: async () => {
      const response: { success: boolean; data: RetellVoice[] } = await fetchWithRetellApi('/api/v1/retell/agent/voice/list', {
        body: JSON.stringify({}),
      });
      return response.data;
    },
    ...options,
  });
}

interface CreateWebCallResponse {
  access_token: string;
  call_id: string;
  agent_id: string;
  call_status: string;
  call_type: string;
  metadata?: any;
}

export async function createWebCall(agentId: string): Promise<CreateWebCallResponse> {
  const response = await fetchWithRetellApi('/api/v1/retell/agent/create-web-call', {
    body: JSON.stringify({
      agent_id: agentId,
      metadata: {
        user_id: "12345",
        session_id: "abc123"
      },
      retell_llm_dynamic_variables: {
        customer_name: "John Doe"
      },
      custom_sip_headers: {
        "X-Custom-Header": "Custom Value"
      },
      opt_out_sensitive_data_storage: true,
      opt_in_signed_url: true
    }),
  });
  return response;
}