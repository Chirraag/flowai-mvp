/**
 * Validation utilities for Scheduling Agent
 * Validates API payloads before sending to ensure data integrity
 */

import type {
  UpdateAppointmentSetupPayload,
  UpdatePatientEligibilityPayload,
  UpdateSchedulingPoliciesPayload,
  UpdateProviderPreferencesPayload,
  AppointmentSetupValues,
  PatientEligibilityValues,
  SchedulingPoliciesValues,
  ProviderPreferencesValues,
} from '@/types/schedulingAgent';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  section?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

/**
 * Validate appointment setup values
 */
export function validateAppointmentSetup(values: AppointmentSetupValues): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate max new patients
  if (!values.maxNewPatients || values.maxNewPatients.trim() === '') {
    errors.push({
      field: 'maxNewPatients',
      message: 'Max new patients per day is required',
      severity: 'error',
      section: 'appointment-setup',
    });
  } else {
    const maxNewPatientsNum = parseInt(values.maxNewPatients, 10);
    if (isNaN(maxNewPatientsNum) || maxNewPatientsNum <= 0) {
      errors.push({
        field: 'maxNewPatients',
        message: 'Max new patients must be a positive number',
        severity: 'error',
        section: 'appointment-setup',
      });
    }
  }

  // Validate max follow-ups
  if (!values.maxFollowUps || values.maxFollowUps.trim() === '') {
    errors.push({
      field: 'maxFollowUps',
      message: 'Max follow-ups per day is required',
      severity: 'error',
      section: 'appointment-setup',
    });
  } else {
    const maxFollowUpsNum = parseInt(values.maxFollowUps, 10);
    if (isNaN(maxFollowUpsNum) || maxFollowUpsNum <= 0) {
      errors.push({
        field: 'maxFollowUps',
        message: 'Max follow-ups must be a positive number',
        severity: 'error',
        section: 'appointment-setup',
      });
    }
  }

  // Validate at least one appointment type is enabled
  const hasEnabledType = values.appointmentTypes.newPatient || 
                         values.appointmentTypes.followUp || 
                         values.appointmentTypes.procedure;
  if (!hasEnabledType) {
    warnings.push({
      field: 'appointmentTypes',
      message: 'At least one appointment type should be enabled',
      severity: 'warning',
      section: 'appointment-setup',
    });
  }

  // Validate procedure-specific field if procedure type is enabled
  if (values.appointmentTypes.procedure && !values.procedureSpecific?.trim()) {
    warnings.push({
      field: 'procedureSpecific',
      message: 'Procedure-specific details recommended when procedure appointments are enabled',
      severity: 'warning',
      section: 'appointment-setup',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
}

/**
 * Validate patient eligibility values
 */
export function validatePatientEligibility(values: PatientEligibilityValues): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate at least one patient type is accepted
  const hasAcceptedType = Object.values(values.patientTypes).some(v => v === true);
  if (!hasAcceptedType) {
    errors.push({
      field: 'patientTypes',
      message: 'At least one patient type must be accepted',
      severity: 'error',
      section: 'patient-eligibility',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
}

/**
 * Validate scheduling policies values
 */
export function validateSchedulingPolicies(values: SchedulingPoliciesValues): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate same-day cutoff time format if same-day is allowed
  if (values.walkInPolicy.allowSameDayAppointments) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (values.walkInPolicy.sameDayCutoffTime && !timeRegex.test(values.walkInPolicy.sameDayCutoffTime)) {
      errors.push({
        field: 'sameDayCutoffTime',
        message: 'Same-day cutoff time must be in HH:MM format (24-hour)',
        severity: 'error',
        section: 'scheduling-policies',
      });
    }
  }

  // Validate minimum cancellation notice
  if (values.cancellationPolicy.minimumCancellationNotice) {
    const minCancellation = parseInt(values.cancellationPolicy.minimumCancellationNotice, 10);
    if (isNaN(minCancellation) || minCancellation < 0) {
      errors.push({
        field: 'minimumCancellationNotice',
        message: 'Minimum cancellation notice must be a non-negative number',
        severity: 'error',
        section: 'scheduling-policies',
      });
    }
  }

  // Validate no-show fee
  if (values.cancellationPolicy.noShowFee) {
    const noShowFee = parseFloat(values.cancellationPolicy.noShowFee);
    if (isNaN(noShowFee) || noShowFee < 0) {
      errors.push({
        field: 'noShowFee',
        message: 'No-show fee must be a non-negative number',
        severity: 'error',
        section: 'scheduling-policies',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
}

/**
 * Validate provider preferences values
 */
export function validateProviderPreferences(values: ProviderPreferencesValues): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate blackout dates format if provided
  if (values.providerBlackoutDates && values.providerBlackoutDates.trim()) {
    const dates = values.providerBlackoutDates.split('\n').filter(d => d.trim());
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    for (const date of dates) {
      if (!dateRegex.test(date.trim())) {
        errors.push({
          field: 'providerBlackoutDates',
          message: `Invalid date format: "${date}". Expected YYYY-MM-DD format`,
          severity: 'error',
          section: 'provider-preferences',
        });
        break; // Only show first error
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
}


/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  return formatted;
}

/**
 * Group errors by section
 */
export function groupErrorsBySection(errors: ValidationError[]): Record<string, ValidationError[]> {
  const grouped: Record<string, ValidationError[]> = {};
  errors.forEach(error => {
    const section = error.section || 'general';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(error);
  });
  return grouped;
}

/**
 * Check if a section has errors
 */
export function sectionHasErrors(errors: ValidationError[], sectionName: string): boolean {
  return errors.some(error => error.section === sectionName);
}

/**
 * Check if a section has warnings
 */
export function sectionHasWarnings(warnings: ValidationError[], sectionName: string): boolean {
  return warnings.some(warning => warning.section === sectionName);
}

/**
 * Get field-specific error
 */
export function getFieldError(errors: ValidationError[], fieldName: string): ValidationError | null {
  return errors.find(error => error.field === fieldName) || null;
}

/**
 * Real-time field validation
 */
export function validateField(fieldName: string, value: string, section: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Basic required field validation
  if (!value || value.trim() === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      severity: 'error',
      section,
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    hasErrors: errors.length > 0,
    hasWarnings: false,
  };
}

