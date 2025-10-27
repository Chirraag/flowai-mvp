import type { OrgLocation, OrgSpecialityService, OrgInsurance } from '../components/launchpad/types';
import type {
  LaunchpadFetchData,
  UploadedDocument,
  AccountDetailsUpdate,
  LocationUpdate,
  SpecialityServiceUpdate,
  InsuranceUpdate,
  PersonUpdate,
  SpecialtyServiceEntryUpdate
} from './launchpad.types';

// =============================================================================
// VALIDATION FUNCTIONS (enhanced for modern dashboard UX)
// =============================================================================

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  section?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: ValidationError;
  warning?: ValidationError;
}

// Utility functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  // US phone validation: exactly 10 digits (no country code for now)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

// Time range validation: expects format "HH:MM - HH:MM" and validates end > start
const isValidTimeRange = (timeRange: string): boolean => {
  if (!timeRange || timeRange.trim() === '') return true; // Empty is valid

  const parts = timeRange.split(' - ');
  if (parts.length !== 2) return false;

  const [startTime, endTime] = parts.map(t => t.trim());

  // Validate HH:MM format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return false;
  }

  // Validate end time is after start time
  return endTime > startTime;
};

const validatePerson = (
  person: { title: string; name: string; email: string; phone: string },
  prefix: string,
  section: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Split name into first and last for validation
  const nameParts = person.name.trim().split(' ');
  const firstName = nameParts[0] || '';

  // First name validation - required and reasonable length
  if (!firstName.trim()) {
    errors.push({
      field: `${prefix}-firstName`,
      message: 'First name is required',
      severity: 'error',
      section,
      suggestion: 'Please enter a first name'
    });
  } else if (firstName.length < 2) {
    errors.push({
      field: `${prefix}-firstName`,
      message: 'First name must be at least 2 characters',
      severity: 'error',
      section,
      suggestion: 'Please enter a valid first name'
    });
  }

  // Email validation - more lenient, only check if provided
  if (person.email.trim() && !isValidEmail(person.email.trim())) {
    errors.push({
      field: `${prefix}-email`,
      message: 'Please enter a valid email address',
      severity: 'error',
      section,
      suggestion: 'Format: user@domain.com'
    });
  }

  // Phone validation - require exactly 10 digits for US phone numbers
  if (person.phone.trim() && !isValidPhoneNumber(person.phone.trim())) {
    errors.push({
      field: `${prefix}-phone`,
      message: 'Please enter a complete 10-digit phone number',
      severity: 'error',
      section,
      suggestion: 'Format: 123-456-7890 (10 digits required)'
    });
  }

  return errors;
};

// Real-time validation for individual fields
export const validateField = (
  fieldName: string,
  value: string | number | undefined,
  section: string,
  options?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  }
): FieldValidationResult => {
  const { required = false, minLength, maxLength, pattern, customValidator } = options || {};

  // Handle empty/undefined values
  if (value === undefined || value === null) {
    if (required) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: 'This field is required',
          severity: 'error',
          section,
          suggestion: 'Please fill in this required field'
        }
      };
    }
    return { isValid: true };
  }

  const stringValue = String(value).trim();

  // Required validation
  if (required && !stringValue) {
    return {
      isValid: false,
      error: {
        field: fieldName,
        message: 'This field is required',
        severity: 'error',
        section,
        suggestion: 'Please fill in this required field'
      }
    };
  }

  // Skip further validation if empty and not required
  if (!stringValue && !required) {
    return { isValid: true };
  }

  // Phone validation for phone fields
  if (fieldName.toLowerCase().includes('phone') && !isValidPhoneNumber(stringValue)) {
    return {
      isValid: false,
      error: {
        field: fieldName,
        message: 'Please enter a complete 10-digit phone number',
        severity: 'error',
        section,
        suggestion: 'Format: 123-456-7890 (10 digits required)'
      }
    };
  }

  // Length validations
  if (minLength && stringValue.length < minLength) {
    return {
      isValid: false,
      error: {
        field: fieldName,
        message: `Minimum ${minLength} characters required`,
        severity: 'error',
        section,
        suggestion: `Please enter at least ${minLength} characters`
      }
    };
  }

  if (maxLength && stringValue.length > maxLength) {
    return {
      isValid: false,
      error: {
        field: fieldName,
        message: `Maximum ${maxLength} characters allowed`,
        severity: 'error',
        section,
        suggestion: `Please limit to ${maxLength} characters`
      }
    };
  }

  // Pattern validation
  if (pattern && !pattern.test(stringValue)) {
    return {
      isValid: false,
      error: {
        field: fieldName,
        message: 'Invalid format',
        severity: 'error',
        section,
        suggestion: 'Please check the format and try again'
      }
    };
  }

  // Custom validation
  if (customValidator) {
    const customError = customValidator(stringValue);
    if (customError) {
      return {
        isValid: false,
        error: {
          field: fieldName,
          message: customError,
          severity: 'error',
          section,
          suggestion: 'Please correct this field'
        }
      };
    }
  }

  return { isValid: true };
};

// Account validation with enhanced structure
export const validateAccountData = (data: {
  accountName: string;
  decisionMakers: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  influencers: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  orderEntryTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  schedulingTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  patientIntakeTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  rcmTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  schedulingPhoneNumbers: string[];
}): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required: account_name
  if (!data.accountName.trim()) {
    errors.push({
      field: 'accountName',
      message: 'Account name is required',
      severity: 'error',
      section: 'overview',
      suggestion: 'Please enter the practice name'
    });
  }

  // Validate all people arrays with section-specific errors
  data.decisionMakers.forEach((person) => {
    errors.push(...validatePerson(person, `dm-${person.id}`, 'decision-makers'));
  });

  data.influencers.forEach((person) => {
    errors.push(...validatePerson(person, `inf-${person.id}`, 'influencers'));
  });

  data.orderEntryTeam.forEach((person) => {
    errors.push(...validatePerson(person, `team-${person.id}`, 'team-reporting'));
  });

  data.schedulingTeam.forEach((person) => {
    errors.push(...validatePerson(person, `team-${person.id}`, 'team-reporting'));
  });

  data.patientIntakeTeam.forEach((person) => {
    errors.push(...validatePerson(person, `team-${person.id}`, 'team-reporting'));
  });

  data.rcmTeam.forEach((person) => {
    errors.push(...validatePerson(person, `team-${person.id}`, 'team-reporting'));
  });

  // Validate scheduling phone numbers
  data.schedulingPhoneNumbers.forEach((phone, index) => {
    if (phone.trim() && !isValidPhoneNumber(phone.trim())) {
      errors.push({
        field: `schedulingPhoneNumbers[${index}]`,
        message: 'Please enter a complete 10-digit phone number',
        severity: 'error',
        section: 'systems-integration',
        suggestion: 'Format: 123-456-7890 (10 digits required)'
      });
    }
  });

  // Check for empty sections and add warnings
  if (data.decisionMakers.length === 0) {
    warnings.push({
      field: 'decisionMakers',
      message: 'No decision makers added',
      severity: 'warning',
      section: 'decision-makers',
      suggestion: 'Consider adding key decision makers for better account management'
    });
  }

  if (data.influencers.length === 0) {
    warnings.push({
      field: 'influencers',
      message: 'No influencers added',
      severity: 'warning',
      section: 'influencers',
      suggestion: 'Consider adding key influencers for comprehensive account coverage'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
};

// Locations validation
export const validateLocationsData = (locations: OrgLocation[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const locationCodes = new Set<string>();

  locations.forEach((location, index) => {
    // Required: location.name
    if (!location.name.trim()) {
      errors.push({
        field: `locations[${index}].name`,
        message: 'Location name is required',
        severity: 'error',
        section: 'locations',
        suggestion: 'Please enter a name for this location'
      });
    }

    // Required: location_id and must be unique
    if (!location.location_id.trim()) {
      errors.push({
        field: `locations[${index}].location_id`,
        message: 'Location ID is required',
        severity: 'error',
        section: 'locations',
        suggestion: 'Please enter a unique identifier for this location'
      });
    } else {
      if (locationCodes.has(location.location_id.trim())) {
        errors.push({
          field: `locations[${index}].location_id`,
          message: 'Location ID must be unique',
          severity: 'error',
          section: 'locations',
          suggestion: 'Each location must have a unique ID'
        });
      }
      locationCodes.add(location.location_id.trim());
    }

    // Validate weekday hours format and range
    if (location.weekday_hours && location.weekday_hours.trim() !== '') {
      if (!isValidTimeRange(location.weekday_hours)) {
        errors.push({
          field: `locations[${index}].weekday_hours`,
          message: 'Invalid weekday hours format or time range',
          severity: 'error',
          section: 'locations',
          suggestion: 'Please select valid start and end times (end must be after start)'
        });
      }
    }

    // Validate weekend hours format and range (can be empty for closed)
    if (location.weekend_hours && location.weekend_hours.trim() !== '') {
      if (!isValidTimeRange(location.weekend_hours)) {
        errors.push({
          field: `locations[${index}].weekend_hours`,
          message: 'Invalid weekend hours format or time range',
          severity: 'error',
          section: 'locations',
          suggestion: 'Please select valid start and end times (end must be after start) or mark as closed'
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
};

// Specialties validation
export const validateSpecialtiesData = (
  specialties: OrgSpecialityService[],
  availableLocationCodes: string[]
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const availableCodesSet = new Set(availableLocationCodes);
  const specialtyNames = new Set<string>();

  specialties.forEach((specialty, index) => {
    // Required: specialty_name
    if (!specialty.specialty_name.trim()) {
      errors.push({
        field: `specialties[${index}].specialty_name`,
        message: 'Specialty name is required',
        severity: 'error',
        section: 'specialties',
        suggestion: 'Please enter a name for this specialty'
      });
    } else {
      // Check for duplicate specialty names (case-insensitive)
      const normalizedName = specialty.specialty_name.trim().toLowerCase();
      if (specialtyNames.has(normalizedName)) {
        errors.push({
          field: `specialties[${index}].specialty_name`,
          message: `Duplicate specialty name: "${specialty.specialty_name.trim()}"`,
          severity: 'error',
          section: 'specialties',
          suggestion: 'Each specialty must have a unique name'
        });
      }
      specialtyNames.add(normalizedName);
    }

    // Require at least one location
    if (specialty.location_ids.length === 0) {
      errors.push({
        field: `specialties[${index}].location_ids`,
        message: 'At least one location must be selected',
        severity: 'error',
        section: 'specialties',
        suggestion: 'Select at least one location where this specialty is offered'
      });
    }

    // location_ids must match available location codes
    specialty.location_ids.forEach((locationId, locIndex) => {
      if (locationId.trim() && !availableCodesSet.has(locationId.trim())) {
        errors.push({
          field: `specialties[${index}].location_ids[${locIndex}]`,
          message: `Location code "${locationId}" does not exist`,
          severity: 'error',
          section: 'specialties',
          suggestion: 'Please select from available locations only'
        });
      }
    });

    // Validate services
    specialty.services.forEach((service, serviceIndex) => {
      if (!service.name.trim()) {
        errors.push({
          field: `specialties[${index}].services[${serviceIndex}].name`,
          message: 'Service name is required',
          severity: 'error',
          section: 'specialties',
          suggestion: 'Please enter a name for this service'
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
};

// Insurance validation (minimal - mostly optional fields)
export const validateInsuranceData = (insurance: OrgInsurance): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // No required fields for insurance, just format validation if provided
  // Could add URL validation for source links if needed

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
  };
};

// Helper functions for error handling and display
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  const formatted: Record<string, string> = {};
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  return formatted;
};

// Group errors by section for better organization
export const groupErrorsBySection = (errors: ValidationError[]): Record<string, ValidationError[]> => {
  const grouped: Record<string, ValidationError[]> = {};
  errors.forEach(error => {
    const section = error.section || 'general';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(error);
  });
  return grouped;
};

// Get field-specific error for real-time validation
export const getFieldError = (fieldName: string, errors: ValidationError[]): ValidationError | undefined => {
  return errors.find(error => error.field === fieldName);
};

// Check if a section has errors
export const sectionHasErrors = (section: string, errors: ValidationError[]): boolean => {
  return errors.some(error => error.section === section);
};

// Check if a section has warnings
export const sectionHasWarnings = (section: string, warnings: ValidationError[]): boolean => {
  return warnings.some(warning => warning.section === section);
};

// Get validation status for a field (valid, invalid, warning, neutral)
export const getFieldValidationStatus = (
  fieldName: string,
  errors: ValidationError[],
  warnings: ValidationError[]
): 'valid' | 'invalid' | 'warning' | 'neutral' => {
  const error = getFieldError(fieldName, errors);
  if (error) return 'invalid';

  const warning = warnings.find(w => w.field === fieldName);
  if (warning) return 'warning';

  return 'neutral'; // No validation status yet
};

// =============================================================================
// DATA MAPPING/TRANSFORMATION FUNCTIONS (from original launchpad.mappers.ts)
// =============================================================================

// Utility functions
const trimString = (str: string): string => str.trim();
const normalizeString = (str: string): string | null => {
  const trimmed = str.trim();
  return trimmed === '' ? null : trimmed;
};
const normalizeNumber = (num: number | null | undefined): number | null => {
  return num === undefined || num === null || isNaN(num) ? null : num;
};
const filterEmptyStrings = (arr: string[]): string[] => {
  return arr.map(trimString).filter(str => str !== '');
};

// Person mapping
const mapPersonToApi = (person: { title: string; name: string; email: string; phone: string }): PersonUpdate => ({
  title: trimString(person.title),
  name: trimString(person.name),
  email: trimString(person.email),
  phone: trimString(person.phone),
});

// Account Details mapping
export const mapAccountUIToApi = (state: {
  accountName: string;
  websiteAddress: string;
  headquartersAddress: string;
  decisionMakers: Array<{ title: string; name: string; email: string; phone: string }>;
  influencers: Array<{ title: string; name: string; email: string; phone: string }>;
  schedulingStructure: string;
  rcmStructure: string;
  orderEntryTeam: Array<{ title: string; name: string; email: string; phone: string }>;
  schedulingTeam: Array<{ title: string; name: string; email: string; phone: string }>;
  patientIntakeTeam: Array<{ title: string; name: string; email: string; phone: string }>;
  rcmTeam: Array<{ title: string; name: string; email: string; phone: string }>;
  orderEntryTeamSize?: number;
  schedulingTeamSize?: number;
  patientIntakeTeamSize?: number;
  rcmTeamSize?: number;
  opportunitySizing: {
    monthly_orders_count?: number | null;
    monthly_patients_scheduled?: number | null;
    monthly_patients_checked_in?: number | null;
  };
  emrSystems: string[];
  telephonySystems: string[];
  schedulingPhoneNumbers: string[];
  insuranceVerificationSystem: string;
  insuranceVerificationDetails: string;
  additionalInfo: string;
  clinicalNotes: string;
}): AccountDetailsUpdate => ({
  account_name: trimString(state.accountName),
  website_address: normalizeString(state.websiteAddress),
  headquarters_address: normalizeString(state.headquartersAddress),
  decision_makers: state.decisionMakers.map(mapPersonToApi),
  influencers: state.influencers.map(mapPersonToApi),
  scheduling_structure: normalizeString(state.schedulingStructure),
  rcm_structure: normalizeString(state.rcmStructure),
  order_entry_team: state.orderEntryTeam.map(mapPersonToApi),
  scheduling_team: state.schedulingTeam.map(mapPersonToApi),
  patient_intake_team: state.patientIntakeTeam.map(mapPersonToApi),
  rcm_team: state.rcmTeam.map(mapPersonToApi),
  order_entry_team_size: normalizeNumber(state.orderEntryTeamSize),
  scheduling_team_size: normalizeNumber(state.schedulingTeamSize),
  patient_intake_team_size: normalizeNumber(state.patientIntakeTeamSize),
  rcm_team_size: normalizeNumber(state.rcmTeamSize),
  monthly_orders_count: normalizeNumber(state.opportunitySizing.monthly_orders_count),
  monthly_patients_scheduled: normalizeNumber(state.opportunitySizing.monthly_patients_scheduled),
  monthly_patients_checked_in: normalizeNumber(state.opportunitySizing.monthly_patients_checked_in),
  emr_ris_systems: filterEmptyStrings(state.emrSystems),
  telephony_ccas_systems: filterEmptyStrings(state.telephonySystems),
  scheduling_phone_numbers: filterEmptyStrings(state.schedulingPhoneNumbers),
  insurance_verification_system: normalizeString(state.insuranceVerificationSystem),
  insurance_verification_details: normalizeString(state.insuranceVerificationDetails),
  additional_info: normalizeString(state.additionalInfo),
  clinical_notes: normalizeString(state.clinicalNotes),
  documents: [],
});

// Locations mapping
export const mapLocationsUIToApi = (locations: OrgLocation[]): LocationUpdate[] => {
  return locations.map(location => ({
    name: trimString(location.name),
    address_line1: trimString(location.address_line1),
    address_line2: location.address_line2 ? trimString(location.address_line2) : null,
    city: trimString(location.city),
    state: trimString(location.state),
    zip_code: trimString(location.zip_code),
    weekday_hours: normalizeString(location.weekday_hours),
    weekend_hours: normalizeString(location.weekend_hours),
    location_id: trimString(location.location_id),
    parking_directions: normalizeString(location.parking_directions),
  }));
};

// Specialties mapping
const mapSpecialtyServiceEntryToApi = (service: {
  name: string;
  patient_prep_requirements?: string;
  faq?: string;
  service_information_name?: string | null;
  service_information_source?: string | null;
}): SpecialtyServiceEntryUpdate => ({
  name: trimString(service.name),
  patient_prep_requirements: service.patient_prep_requirements ? normalizeString(service.patient_prep_requirements) : null,
  faq: service.faq ? normalizeString(service.faq) : null,
  service_information_name: service.service_information_name ? normalizeString(service.service_information_name) : null,
  service_information_source: service.service_information_source ? normalizeString(service.service_information_source) : null,
});

export const mapSpecialtiesUIToApi = (specialties: OrgSpecialityService[]): SpecialityServiceUpdate[] => {
  const result = specialties.map(specialty => ({
    specialty_name: trimString(specialty.specialty_name),
    location_ids: specialty.location_ids, // Include location_ids as required by API
    physician_names_source_type: specialty.physician_names_source_type ? normalizeString(specialty.physician_names_source_type) : null,
    physician_names_source_name: specialty.physician_names_source_name ? normalizeString(specialty.physician_names_source_name) : null,
    new_patients_source_type: specialty.new_patients_source_type ? normalizeString(specialty.new_patients_source_type) : null,
    new_patients_source_name: specialty.new_patients_source_name ? normalizeString(specialty.new_patients_source_name) : null,
    physician_locations_source_type: specialty.physician_locations_source_type ? normalizeString(specialty.physician_locations_source_type) : null,
    physician_locations_source_name: specialty.physician_locations_source_name ? normalizeString(specialty.physician_locations_source_name) : null,
    physician_credentials_source_type: specialty.physician_credentials_source_type ? normalizeString(specialty.physician_credentials_source_type) : null,
    physician_credentials_source_name: specialty.physician_credentials_source_name ? normalizeString(specialty.physician_credentials_source_name) : null,
    services: specialty.services
      .filter(service => trimString(service.name) !== '')
      .map(service => ({
        name: trimString(service.name),
        patient_prep_requirements: service.patient_prep_requirements ? normalizeString(service.patient_prep_requirements) : null,
        faq: service.faq ? normalizeString(service.faq) : null,
        service_information_name: service.service_information_name ? normalizeString(service.service_information_name) : null,
        service_information_source: service.service_information_source ? normalizeString(service.service_information_source) : null,
      })),
    services_offered_source_type: specialty.services_offered_source_type ? normalizeString(specialty.services_offered_source_type) : null,
    services_offered_source_name: specialty.services_offered_source_name ? normalizeString(specialty.services_offered_source_name) : null,
    patient_prep_source_type: specialty.patient_prep_source_type ? normalizeString(specialty.patient_prep_source_type) : null,
    patient_prep_source_name: specialty.patient_prep_source_name ? normalizeString(specialty.patient_prep_source_name) : null,
    patient_faqs_source_type: specialty.patient_faqs_source_type ? normalizeString(specialty.patient_faqs_source_type) : null,
    patient_faqs_source_name: specialty.patient_faqs_source_name ? normalizeString(specialty.patient_faqs_source_name) : null,
    documents: [],
  }));

  console.log('mapSpecialtiesUIToApi: Mapped result:', result);
  return result;
};

// Insurance mapping
export const mapInsuranceUIToApi = (insurance: OrgInsurance): InsuranceUpdate => ({
  accepted_payers_source: insurance.accepted_payers_source ? normalizeString(insurance.accepted_payers_source) : null,
  accepted_payers_source_details: insurance.accepted_payers_source_details ? normalizeString(insurance.accepted_payers_source_details) : null,
  accepted_payers_source_link: insurance.accepted_payers_source_link ? normalizeString(insurance.accepted_payers_source_link) : null,
  insurance_verification_source: insurance.insurance_verification_source ? normalizeString(insurance.insurance_verification_source) : null,
  insurance_verification_source_details: insurance.insurance_verification_source_details ? normalizeString(insurance.insurance_verification_source_details) : null,
  insurance_verification_source_link: insurance.insurance_verification_source_link ? normalizeString(insurance.insurance_verification_source_link) : null,
  patient_copay_source: insurance.patient_copay_source ? normalizeString(insurance.patient_copay_source) : null,
  patient_copay_source_details: insurance.patient_copay_source_details ? normalizeString(insurance.patient_copay_source_details) : null,
  patient_copay_source_link: insurance.patient_copay_source_link ? normalizeString(insurance.patient_copay_source_link) : null,
  documents: [],
  is_active: insurance.is_active,
});

// Cross-tab dependency helpers
export const computeLocationIdChanges = (
  original: Array<{ id: string; location_id: string }>,
  updated: OrgLocation[]
): Map<string, string> => {
  const changes = new Map<string, string>();

  // Create a map of UI id to original location_id
  const originalMap = new Map(original.map(loc => [loc.id, loc.location_id]));

  updated.forEach(updatedLocation => {
    const originalLocationId = originalMap.get(updatedLocation.id);
    if (originalLocationId && originalLocationId !== updatedLocation.location_id) {
      changes.set(originalLocationId, updatedLocation.location_id);
    }
  });

  return changes;
};

export const applyLocationCodeRenamesToSpecialties = (
  specialties: OrgSpecialityService[],
  codeChanges: Map<string, string>
): OrgSpecialityService[] => {
  if (codeChanges.size === 0) return specialties;

  return specialties.map(specialty => ({
    ...specialty,
    location_ids: specialty.location_ids.map(locationId =>
      codeChanges.get(locationId) || locationId
    ),
  }));
};

export const syncSpecialtiesWithLocations = (
  specialties: OrgSpecialityService[],
  locations: OrgLocation[],
  originalLocations: Array<{ id: string; location_id: string }>
): OrgSpecialityService[] => {
  // Compute location code changes
  const codeChanges = computeLocationIdChanges(originalLocations, locations);

  // Check if any specialties reference removed locations
  const currentLocationCodes = new Set(locations.map(loc => loc.location_id));
  const hasRemovedLocations = specialties.some(spec =>
    spec.location_ids.some(code => !currentLocationCodes.has(code))
  );

  // If no changes needed, return original specialties
  if (codeChanges.size === 0 && !hasRemovedLocations) {
    return specialties;
  }

  // Apply code renames first
  let updatedSpecialties = applyLocationCodeRenamesToSpecialties(specialties, codeChanges);

  // Filter out removed location codes
  updatedSpecialties = updatedSpecialties.map(spec => ({
    ...spec,
    location_ids: spec.location_ids.filter(code => currentLocationCodes.has(code))
  }));

  return updatedSpecialties;
};

// =============================================================================
// LOCATION DELETION VALIDATION
// =============================================================================

export const validateLocationDeletion = (
  locationId: string,
  locationName: string,
  specialties: OrgSpecialityService[]
): { canDelete: boolean; affectedSpecialties: string[]; message: string } => {
  const affectedSpecialties = specialties.filter(spec =>
    spec.location_ids.includes(locationId)
  );

  if (affectedSpecialties.length === 0) {
    return { canDelete: true, affectedSpecialties: [], message: "" };
  }

  const specialtyNames = affectedSpecialties.map(spec => spec.specialty_name || 'Unnamed Specialty');

  return {
    canDelete: true, // Allow deletion but with cleanup
    affectedSpecialties: specialtyNames,
    message: `Location "${locationName}" is used by ${specialtyNames.length} specialty(ies). It will be automatically removed from these specialties.`
  };
};

// =============================================================================
// UI SELECTOR FUNCTIONS (from original launchpad.selectors.ts)
// =============================================================================

import type { Location, SpecialtyService } from './launchpad.types';

export const makeLocationCodeMap = (locations: Location[]) =>
  new Map(locations.map((loc) => [loc.location_id, loc]));

export const makeLocationOptions = (locations: Location[]) =>
  locations.map((loc) => ({ value: loc.location_id, label: `${loc.name} (${loc.location_id})` }));

export const resolveSpecialtyLocations = (
  specialty: SpecialtyService,
  codeMap: Map<string, Location>
) => {
  const resolved = specialty.location_ids
    .map((code) => codeMap.get(code))
    .filter(Boolean) as Location[];
  const unresolved = specialty.location_ids.filter((code) => !codeMap.has(code));
  return { resolved, unresolved };
};

// =============================================================================
// DOCUMENT MANAGEMENT FUNCTIONS (from original launchpad.documents.ts)
// =============================================================================

/**
 * Document sourcing strategy for UI rendering:
 * - Account/Insurance: read from data.account_details.documents and data.insurance.documents
 * - Locations/Specialties: treat as tab-scoped, union/deduplicate URLs across all records
 */

export type TabType = 'account' | 'locations' | 'specialties' | 'insurance';

/**
 * Extract documents for a specific tab from the launchpad data
 */
export const getDocumentsForTab = (data: LaunchpadFetchData | undefined, tab: TabType): UploadedDocument[] => {
  if (!data) return [];

  switch (tab) {
    case 'account':
      return (data.account_details?.documents as UploadedDocument[]) || [];

    case 'insurance':
      return (data.insurance?.documents as UploadedDocument[]) || [];

    case 'locations': {
      // Union/deduplicate documents across all locations
      const allDocs: UploadedDocument[] = [];
      const seenUrls = new Set<string>();

      data.locations?.forEach(location => {
        const locationDocs = (location.documents as UploadedDocument[]) || [];
        locationDocs.forEach(doc => {
          if (!seenUrls.has(doc.url)) {
            seenUrls.add(doc.url);
            allDocs.push(doc);
          }
        });
      });

      return allDocs;
    }

    case 'specialties': {
      // Union/deduplicate documents across all specialties
      const allDocs: UploadedDocument[] = [];
      const seenUrls = new Set<string>();

      data.speciality_services?.forEach(specialty => {
        const specialtyDocs = (specialty.documents as UploadedDocument[]) || [];
        specialtyDocs.forEach(doc => {
          if (!seenUrls.has(doc.url)) {
            seenUrls.add(doc.url);
            allDocs.push(doc);
          }
        });
      });

      return allDocs;
    }

    default:
      return [];
  }
};

/**
 * Get the appropriate document title for each tab
 */
export const getDocumentTitle = (tab: TabType): string => {
  switch (tab) {
    case 'account':
      return 'Account Documents';
    case 'locations':
      return 'Location Documents';
    case 'specialties':
      return 'Specialty Documents';
    case 'insurance':
      return 'Insurance Documents';
    default:
      return 'Documents';
  }
};
