import type { CustomerSupportAgentData, FAQ, CustomerSupportAgentConfig } from './customer-support.types';

/**
 * Customer Support Agent Data Mappers
 * Converts between API and UI data formats
 */

export const apiToUi = {
  agentConfig: (apiData: CustomerSupportAgentData): CustomerSupportAgentConfig => ({
    agent_name: apiData.agent_name || '',
    language: apiData.language || '',
    voice: apiData.voice || '',
    agent_instructions: apiData.agent_instructions || '',
    human_transfer_criteria: apiData.human_transfer_criteria || '',
  }),
};

export const uiToApi = {
  agentConfig: (uiData: CustomerSupportAgentConfig) => ({
    agent_name: uiData.agent_name,
    language: uiData.language,
    voice: uiData.voice,
    agent_instructions: uiData.agent_instructions,
    human_transfer_criteria: uiData.human_transfer_criteria,
  }),

  faqs: (faqs: FAQ[]) => ({
    faqs: faqs,
  }),
};
