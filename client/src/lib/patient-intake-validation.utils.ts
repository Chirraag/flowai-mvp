// Patient Intake Agent Validation Utilities
// Centralized validation logic for all patient intake configuration sections

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning';
  section: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Validation for Field & Content Rules Tab
export function validateFieldContentRules(values: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!values) {
    return {
      valid: false,
      errors: [{ field: 'general', message: 'Field content rules data is missing', type: 'error', section: 'field-content-rules' }],
      warnings: []
    };
  }

  const { fieldRequirements, specialInstructions } = values;

  // Validate field requirements
  if (!fieldRequirements) {
    errors.push({
      field: 'fieldRequirements',
      message: 'Field requirements are required',
      type: 'error',
      section: 'field-content-rules'
    });
  } else {
    // Required fields must exist and have valid values
    const requiredFields = ['patientName', 'dateOfBirth', 'phoneNumber'];
    const validValues = ['required', 'optional'];

    for (const field of requiredFields) {
      if (!fieldRequirements[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          type: 'error',
          section: 'field-content-rules'
        });
      } else if (!validValues.includes(fieldRequirements[field])) {
        errors.push({
          field,
          message: `${field} must be either "required" or "optional"`,
          type: 'error',
          section: 'field-content-rules'
        });
      }
    }

    // Optional fields should still have valid values if provided
    const optionalFields = ['email', 'insuranceId', 'emergencyContact', 'preferredLanguage'];
    for (const field of optionalFields) {
      if (fieldRequirements[field] && !validValues.includes(fieldRequirements[field])) {
        errors.push({
          field,
          message: `${field} must be either "required" or "optional"`,
          type: 'error',
          section: 'field-content-rules'
        });
      }
    }
  }

  // Validate special instructions
  if (!specialInstructions) {
    warnings.push({
      field: 'specialInstructions',
      message: 'Special instructions are recommended for better patient guidance',
      type: 'warning',
      section: 'field-content-rules'
    });
  } else {
    // Check if at least one instruction is provided
    const hasAnyInstruction = 
      (specialInstructions.menoresInstructions && specialInstructions.menoresInstructions.trim().length > 0) ||
      (specialInstructions.noInsuranceInstructions && specialInstructions.noInsuranceInstructions.trim().length > 0) ||
      (specialInstructions.languageBarrierInstructions && specialInstructions.languageBarrierInstructions.trim().length > 0);

    if (!hasAnyInstruction) {
      warnings.push({
        field: 'specialInstructions',
        message: 'Consider adding at least one special instruction for better patient guidance',
        type: 'warning',
        section: 'field-content-rules'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Validation for Delivery Methods Tab
export function validateDeliveryMethods(values: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!values) {
    return {
      valid: false,
      errors: [{ field: 'general', message: 'Delivery methods data is missing', type: 'error', section: 'delivery-methods' }],
      warnings: []
    };
  }

  const { formatPreferences, consentMethods } = values;

  // Validate format preferences - at least one must be enabled
  if (!formatPreferences) {
    errors.push({
      field: 'formatPreferences',
      message: 'Format preferences are required',
      type: 'error',
      section: 'delivery-methods'
    });
  } else {
    const hasAnyMethod = 
      formatPreferences.textMessageLink ||
      formatPreferences.voiceCall ||
      formatPreferences.qrCode ||
      formatPreferences.emailLink ||
      formatPreferences.inPersonTablet;

    if (!hasAnyMethod) {
      errors.push({
        field: 'formatPreferences',
        message: 'At least one delivery method must be enabled',
        type: 'error',
        section: 'delivery-methods'
      });
    }
  }

  // Validate consent methods
  if (!consentMethods) {
    errors.push({
      field: 'consentMethods',
      message: 'Consent methods are required',
      type: 'error',
      section: 'delivery-methods'
    });
  } else {
    // If any consent method is enabled, consent language must be provided
    if ((consentMethods.digitalSignature || consentMethods.verbalConsentRecording)) {
      if (!consentMethods.consentLanguage || consentMethods.consentLanguage.trim().length === 0) {
        errors.push({
          field: 'consentLanguage',
          message: 'Consent Text is required when consent methods are enabled',
          type: 'error',
          section: 'delivery-methods'
        });
      }
    }

    // Warning if no consent method is enabled
    if (!consentMethods.digitalSignature && !consentMethods.verbalConsentRecording) {
      warnings.push({
        field: 'consentMethods',
        message: 'Consider enabling at least one consent method for HIPAA compliance',
        type: 'warning',
        section: 'delivery-methods'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

// Utility functions for error formatting and display
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return errors.map((e, i) => `${i + 1}. ${e.message}`).join('\n');
}

export function groupErrorsBySection(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.section]) {
      acc[error.section] = [];
    }
    acc[error.section].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
}

export function sectionHasErrors(section: string, errors: ValidationError[]): boolean {
  return errors.some(e => e.section === section);
}

export function sectionHasWarnings(section: string, warnings: ValidationError[]): boolean {
  return warnings.some(w => w.section === section);
}

export function getFieldError(field: string, errors: ValidationError[]): string | undefined {
  const error = errors.find(e => e.field === field);
  return error?.message;
}

