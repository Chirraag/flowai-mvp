// Utility functions for mapping between API responses and patient-intake tab data structures
// This ensures consistent data transformation and reduces errors when integrating with tabs

// Types for API response data (based on GET /api/v1/patient-intake-agent/{id})
export interface PatientIntakeApiData {
  id: string;
  org_id: number;
  agent_name: string;
  language: string;
  voice: string;
  agent_instructions: string;
  human_transfer_criteria: string;
  field_requirements: Record<string, string>; // e.g., { "patient_name": "required" }
  special_instructions: Record<string, string>; // e.g., { "minors_instructions": "..." }
  delivery_methods: Record<string, boolean>; // e.g., { "text_message_link": true }
  signature_consent: {
    digital_signature: boolean;
    verbal_consent_recording: boolean;
    consent_language: string;
    consent_languages_available: string[];
  };
  intake_forms: any[];
  modality_forms: any[];
  custom_forms: any[];
  workflows: any[];
  current_version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Types for tab-specific data (derived from each tab's getValues() output)
export interface FieldContentRulesTabData {
  fieldRequirements: Record<string, string>;
  specialInstructions: Record<string, string>;
}

export interface DeliveryMethodsTabData {
  formatPreferences: Record<string, boolean>;
  consentMethods: {
    digitalSignature: boolean;
    verbalConsentRecording: boolean;
    consentLanguage: string;
  };
}

export interface PatientAgentConfigTabData {
  agentName: string;
  language: string;
  voice: string;
  agentInstructions: string;
  humanTransferCriteria: string;
}

export interface FormsQuestionnairesTabData {
  intakeForms: {
    adaptiveIntakeQuestionnaire: boolean;
    consentForms: boolean;
  };
  modalityForms: {
    mriSafetyQuestionnaire: boolean;
    urologySymptomSurvey: boolean;
    preProcedureInstructions: boolean;
  };
}

// Mappers: API to Tab Format
/**
 * Maps API response data to FieldContentRulesTab format.
 */
export function mapApiToFieldContentRules(apiData: PatientIntakeApiData): FieldContentRulesTabData {
  const fr = apiData.field_requirements || {};
  const si = apiData.special_instructions || {};
  return {
    fieldRequirements: {
      patientName: fr.patient_name ?? "required",
      dateOfBirth: fr.date_of_birth ?? "required",
      phoneNumber: fr.phone_number ?? "required",
      email: fr.email ?? "optional",
      insuranceId: fr.insurance_id ?? "optional",
      emergencyContact: fr.emergency_contact ?? "required",
      preferredLanguage: fr.preferred_language ?? "optional",
    },
    specialInstructions: {
      menoresInstructions: si.minors_instructions ?? "",
      noInsuranceInstructions: si.no_insurance_instructions ?? "",
      languageBarrierInstructions: si.language_barrier_instructions ?? "",
    },
  };
}

/**
 * Maps API response data to DeliveryMethodsTab format.
 */
export function mapApiToDeliveryMethods(apiData: PatientIntakeApiData): DeliveryMethodsTabData {
  const dm = apiData.delivery_methods || {};
  const sc = apiData.signature_consent || {};
  return {
    formatPreferences: {
      textMessageLink: !!dm.text_message_link,
      voiceCall: !!dm.voice_call,
      qrCode: !!dm.qr_code,
      emailLink: !!dm.email_link,
      inPersonTablet: !!dm.in_person_tablet,
    },
    consentMethods: {
      digitalSignature: !!sc.digital_signature,
      verbalConsentRecording: !!sc.verbal_consent_recording,
      consentLanguage: sc.consent_language || "",
    },
  };
}

/**
 * Maps API response data to PatientAgentConfigTab format.
 */
export function mapApiToAgentConfig(apiData: PatientIntakeApiData): PatientAgentConfigTabData {
  return {
    agentName: apiData.agent_name || "",
    language: apiData.language || "",
    voice: apiData.voice || "",
    agentInstructions: apiData.agent_instructions || "",
    humanTransferCriteria: apiData.human_transfer_criteria || "",
  };
}

/**
 * Maps API response data to FormsQuestionnairesTab format.
 */
export function mapApiToFormsQuestionnaires(apiData: PatientIntakeApiData): FormsQuestionnairesTabData {
  return {
    intakeForms: {
      adaptiveIntakeQuestionnaire: true, // Default to true, can be made configurable later
      consentForms: true, // Default to true, can be made configurable later
    },
    modalityForms: {
      mriSafetyQuestionnaire: false, // Default to false, can be made configurable later
      urologySymptomSurvey: false, // Default to false, can be made configurable later
      preProcedureInstructions: false, // Default to false, can be made configurable later
    },
  };
}

// Reverse Mappers: Tab Format to API Payload (for PUT requests)
/**
 * Maps FieldContentRulesTab data to API PUT payload for /field-requirements.
 */
export function mapFieldContentRulesToApi(tabData: FieldContentRulesTabData) {
  const fr = tabData.fieldRequirements || {};
  const si = tabData.specialInstructions || {};
  return {
    field_requirements: {
      patient_name: fr.patientName,
      date_of_birth: fr.dateOfBirth,
      phone_number: fr.phoneNumber,
      email: fr.email,
      insurance_id: fr.insuranceId,
      emergency_contact: fr.emergencyContact,
      preferred_language: fr.preferredLanguage,
    },
    special_instructions: {
      minors_instructions: si.menoresInstructions,
      no_insurance_instructions: si.noInsuranceInstructions,
      language_barrier_instructions: si.languageBarrierInstructions,
    },
  };
}

/**
 * Maps DeliveryMethodsTab data to API PUT payload for /delivery-methods.
 */
export function mapDeliveryMethodsToApi(tabData: DeliveryMethodsTabData) {
  return {
    delivery_methods: {
      text_message_link: !!tabData.formatPreferences.textMessageLink,
      voice_call: !!tabData.formatPreferences.voiceCall,
      qr_code: !!tabData.formatPreferences.qrCode,
      email_link: !!tabData.formatPreferences.emailLink,
      in_person_tablet: !!tabData.formatPreferences.inPersonTablet,
    },
    signature_consent: {
      digital_signature: !!tabData.consentMethods.digitalSignature,
      verbal_consent_recording: !!tabData.consentMethods.verbalConsentRecording,
      consent_language: tabData.consentMethods.consentLanguage,
      consent_languages_available: [], // Placeholder; update based on tab if needed
    },
  };
}

/**
 * Maps PatientAgentConfigTab data to API PUT payload for /agent-config.
 */
export function mapAgentConfigToApi(tabData: PatientAgentConfigTabData) {
  return {
    agent_name: tabData.agentName,
    language: tabData.language,
    voice: tabData.voice,
    agent_instructions: tabData.agentInstructions,
    human_transfer_criteria: tabData.humanTransferCriteria,
  };
}

