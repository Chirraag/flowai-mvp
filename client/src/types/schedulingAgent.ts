/**
 * Types for Scheduling Agent API
 */

// Base response structure
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// GET /scheduling-agent/:id response
export interface SchedulingAgent {
  id: string;
  org_id: number;
  agent_id: string;
  agent_name: string;
  language: string;
  voice: string;
  agent_instructions: string;
  human_transfer_criteria: string;
  appointment_types: {
    new_patient: boolean;
    follow_up: boolean;
    procedure: boolean;
  };
  new_patient_duration: string;
  followup_duration: string;
  procedure_specific: string;
  procedure_duration: string;
  max_new_patients_per_day: number;
  max_followups_per_day: number;
  patient_types_accepted: {
    new_patients: boolean;
    existing_patients: boolean;
    self_pay: boolean;
    hmo: boolean;
    ppo: boolean;
    medicare: boolean;
    medicaid: boolean;
  };
  referral_requirements: {
    services_requiring_referrals: string[];
    insurance_plans_requiring_referrals: string[];
  };
  accept_walkins: boolean;
  allow_same_day: boolean;
  same_day_cutoff_time: string; // "HH:MM:SS"
  min_cancellation_hours: number;
  no_show_fee: string;
  provider_preferences: {
    blackout_dates: string[];
    established_patients_only_days: string;
    custom_scheduling_rules: string;
  };
  workflows: any[]; // Placeholder, handled separately
  current_version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

// PUT payloads for each endpoint

export interface UpdateAppointmentSetupPayload {
  appointment_types: {
    new_patient: boolean;
    follow_up: boolean;
    procedure: boolean;
  };
  new_patient_duration: string;
  followup_duration: string;
  procedure_specific: string;
  procedure_duration: string;
  max_new_patients_per_day: number;
  max_followups_per_day: number;
}

export interface UpdatePatientEligibilityPayload {
  patient_types_accepted: {
    new_patients: boolean;
    existing_patients: boolean;
    self_pay: boolean;
    hmo: boolean;
    ppo: boolean;
    medicare: boolean;
    medicaid: boolean;
  };
  referral_requirements: {
    services_requiring_referrals: string[];
    insurance_plans_requiring_referrals: string[];
  };
}

export interface UpdateSchedulingPoliciesPayload {
  accept_walkins: boolean;
  allow_same_day: boolean;
  same_day_cutoff_time: string; // "HH:MM:SS"
  min_cancellation_hours: number;
  no_show_fee: string;
}

export interface UpdateProviderPreferencesPayload {
  provider_preferences: {
    blackout_dates: string[];
    established_patients_only_days: string;
    custom_scheduling_rules: string;
  };
}

export interface UpdateAgentConfigPayload {
  agent_name: string;
  language: string;
  voice: string;
  agent_instructions: string;
  human_transfer_criteria: string;
}

export interface UpdateVoicePayload {
  voice: string;
}

// Update response structure
export interface UpdateResponse {
  id: string;
  updated_at: string;
  current_version: number;
  voice?: string; // Only for voice updates
}

// UI state types (internal to components)
export interface AppointmentSetupValues {
  newPatientDuration: string;
  followUpDuration: string;
  procedureSpecific: string;
  procedureDuration: string;
  maxNewPatients: string;
  maxFollowUps: string;
  appointmentTypes: {
    newPatient: boolean;
    followUp: boolean;
    procedure: boolean;
  };
}

export interface PatientEligibilityValues {
  patientTypes: {
    newPatients: boolean;
    existingPatients: boolean;
    selfPay: boolean;
    hmo: boolean;
    ppo: boolean;
    medicare: boolean;
    medicaid: boolean;
  };
  referralRequirements: {
    servicesRequiringReferrals: string;
    insurancePlansRequiringReferrals: string;
  };
}

export interface SchedulingPoliciesValues {
  walkInPolicy: {
    acceptWalkIns: boolean;
    allowSameDayAppointments: boolean;
    sameDayCutoffTime: string;
  };
  cancellationPolicy: {
    minimumCancellationNotice: string;
    noShowFee: string;
  };
}

export interface ProviderPreferencesValues {
  providerBlackoutDates: string;
  establishedPatientsOnlyDays: string;
  customSchedulingRules: string;
}

export interface AgentConfigValues {
  agentName: string;
  language: string;
  voice: string;
  agentInstructions: string;
  humanTransferCriteria: string;
}

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
