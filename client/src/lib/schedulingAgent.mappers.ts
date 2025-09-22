import type { SchedulingAgent } from '@/types/schedulingAgent';
import type {
  AppointmentSetupValues,
  PatientEligibilityValues,
  SchedulingPoliciesValues,
  ProviderPreferencesValues,
  AgentConfigValues,
} from '@/types/schedulingAgent';

/**
 * Utility functions for mapping between API and UI data formats
 */

/**
 * Time conversion utilities
 */
export const timeHelpers = {
  /**
   * Convert API time format (HH:MM:SS) to UI input format (HH:MM)
   */
  apiTimeToInput(apiTime: string): string {
    if (!apiTime) return '';
    const [hours, minutes] = apiTime.split(':');
    return `${hours}:${minutes}`;
  },

  /**
   * Convert UI time format (HH:MM) to API format (HH:MM:00)
   */
  inputTimeToApi(inputTime: string): string {
    if (!inputTime) return '00:00:00';
    return `${inputTime}:00`;
  },
};

/**
 * Textarea array conversion utilities
 */
export const textareaHelpers = {
  /**
   * Convert array to newline-separated string for textarea
   */
  arrayToTextarea(array: string[]): string {
    if (!array || !Array.isArray(array)) return '';
    return array.filter(item => item && item.trim()).join('\n');
  },

  /**
   * Convert newline-separated string from textarea to array
   */
  textareaToArray(textarea: string): string[] {
    if (!textarea || !textarea.trim()) return [];
    return textarea
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  },
};

/**
 * Duration conversion utilities
 */
export const durationHelpers = {
  /**
   * Convert API duration format ("30 minutes") to UI format ("30")
   */
  apiDurationToUi(apiDuration: string): string {
    if (!apiDuration) return '';
    const match = apiDuration.match(/^(\d+)\s+minutes?$/i);
    return match ? match[1] : '';
  },

  /**
   * Convert UI duration format ("30") to API format ("30 minutes")
   */
  uiDurationToApi(uiDuration: string): string {
    if (!uiDuration || !uiDuration.trim()) return '';
    return `${uiDuration.trim()} minutes`;
  },
};

/**
 * Mapping functions: API → UI
 */
export const apiToUi = {
  /**
   * Map appointment setup from API to UI
   */
  appointmentSetup(api: SchedulingAgent): AppointmentSetupValues {
    return {
      newPatientDuration: durationHelpers.apiDurationToUi(api.new_patient_duration),
      followUpDuration: durationHelpers.apiDurationToUi(api.followup_duration),
      procedureSpecific: api.procedure_specific || '',
      procedureDuration: durationHelpers.apiDurationToUi(api.procedure_duration),
      maxNewPatients: String(api.max_new_patients_per_day || 0),
      maxFollowUps: String(api.max_followups_per_day || 0),
      appointmentTypes: {
        newPatient: api.appointment_types?.new_patient ?? true,
        followUp: api.appointment_types?.follow_up ?? true,
        procedure: api.appointment_types?.procedure ?? false,
      },
    };
  },

  /**
   * Map patient eligibility from API to UI
   */
  patientEligibility(api: SchedulingAgent): PatientEligibilityValues {
    return {
      patientTypes: {
        newPatients: api.patient_types_accepted?.new_patients ?? true,
        existingPatients: api.patient_types_accepted?.existing_patients ?? true,
        selfPay: api.patient_types_accepted?.self_pay ?? true,
        hmo: api.patient_types_accepted?.hmo ?? false,
        ppo: api.patient_types_accepted?.ppo ?? true,
        medicare: api.patient_types_accepted?.medicare ?? true,
        medicaid: api.patient_types_accepted?.medicaid ?? false,
      },
      referralRequirements: {
        servicesRequiringReferrals: textareaHelpers.arrayToTextarea(
          api.referral_requirements?.services_requiring_referrals || []
        ),
        insurancePlansRequiringReferrals: textareaHelpers.arrayToTextarea(
          api.referral_requirements?.insurance_plans_requiring_referrals || []
        ),
      },
    };
  },

  /**
   * Map scheduling policies from API to UI
   */
  schedulingPolicies(api: SchedulingAgent): SchedulingPoliciesValues {
    return {
      walkInPolicy: {
        acceptWalkIns: api.accept_walkins ?? false,
        allowSameDayAppointments: api.allow_same_day ?? true,
        sameDayCutoffTime: timeHelpers.apiTimeToInput(api.same_day_cutoff_time || '14:00:00'),
      },
      cancellationPolicy: {
        minimumCancellationNotice: String(api.min_cancellation_hours || 24),
        noShowFee: api.no_show_fee || '50.00',
      },
    };
  },

  /**
   * Map provider preferences from API to UI
   */
  providerPreferences(api: SchedulingAgent): ProviderPreferencesValues {
    return {
      providerBlackoutDates: textareaHelpers.arrayToTextarea(
        api.provider_preferences?.blackout_dates || []
      ),
      establishedPatientsOnlyDays: api.provider_preferences?.established_patients_only_days || '',
      customSchedulingRules: api.provider_preferences?.custom_scheduling_rules || '',
    };
  },

  /**
   * Map agent config from API to UI
   */
  agentConfig(api: SchedulingAgent): AgentConfigValues {
    return {
      agentName: api.agent_name || 'Flow Scheduling Agent',
      language: api.language || 'en-US',
      voice: api.voice || 'nova',
      agentInstructions: api.agent_instructions || '',
      humanTransferCriteria: api.human_transfer_criteria || '',
    };
  },
};

/**
 * Mapping functions: UI → API
 */
export const uiToApi = {
  /**
   * Map appointment setup from UI to API
   */
  appointmentSetup(values: AppointmentSetupValues) {
    return {
      appointment_types: {
        new_patient: values.appointmentTypes.newPatient,
        follow_up: values.appointmentTypes.followUp,
        procedure: values.appointmentTypes.procedure,
      },
      new_patient_duration: durationHelpers.uiDurationToApi(values.newPatientDuration),
      followup_duration: durationHelpers.uiDurationToApi(values.followUpDuration),
      procedure_specific: values.procedureSpecific,
      procedure_duration: durationHelpers.uiDurationToApi(values.procedureDuration),
      max_new_patients_per_day: parseInt(values.maxNewPatients) || 0,
      max_followups_per_day: parseInt(values.maxFollowUps) || 0,
    };
  },

  /**
   * Map patient eligibility from UI to API
   */
  patientEligibility(values: PatientEligibilityValues) {
    return {
      patient_types_accepted: {
        new_patients: values.patientTypes.newPatients,
        existing_patients: values.patientTypes.existingPatients,
        self_pay: values.patientTypes.selfPay,
        hmo: values.patientTypes.hmo,
        ppo: values.patientTypes.ppo,
        medicare: values.patientTypes.medicare,
        medicaid: values.patientTypes.medicaid,
      },
      referral_requirements: {
        services_requiring_referrals: textareaHelpers.textareaToArray(
          values.referralRequirements.servicesRequiringReferrals
        ),
        insurance_plans_requiring_referrals: textareaHelpers.textareaToArray(
          values.referralRequirements.insurancePlansRequiringReferrals
        ),
      },
    };
  },

  /**
   * Map scheduling policies from UI to API
   */
  schedulingPolicies(values: SchedulingPoliciesValues) {
    // Format no_show_fee as a number with 2 decimal places
    const formatFee = (fee: string): string => {
      const numericFee = parseFloat(fee) || 0;
      return numericFee.toFixed(2);
    };

    return {
      accept_walkins: values.walkInPolicy.acceptWalkIns,
      allow_same_day: values.walkInPolicy.allowSameDayAppointments,
      same_day_cutoff_time: timeHelpers.inputTimeToApi(values.walkInPolicy.sameDayCutoffTime),
      min_cancellation_hours: parseInt(values.cancellationPolicy.minimumCancellationNotice) || 24,
      no_show_fee: formatFee(values.cancellationPolicy.noShowFee),
    };
  },

  /**
   * Map provider preferences from UI to API
   */
  providerPreferences(values: ProviderPreferencesValues) {
    return {
      provider_preferences: {
        blackout_dates: textareaHelpers.textareaToArray(values.providerBlackoutDates),
        established_patients_only_days: values.establishedPatientsOnlyDays,
        custom_scheduling_rules: values.customSchedulingRules,
      },
    };
  },

  /**
   * Map agent config from UI to API
   */
  agentConfig(values: AgentConfigValues) {
    return {
      agent_name: values.agentName,
      language: values.language,
      voice: values.voice,
      agent_instructions: values.agentInstructions,
      human_transfer_criteria: values.humanTransferCriteria,
    };
  },
};
