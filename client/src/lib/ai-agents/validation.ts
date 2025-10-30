/**
 * Shared validation utilities for AI Agents
 * Handles validation orchestration across multiple tabs
 */

import type { ValidationResult, ValidationError } from './types';

/**
 * Orchestrate validation across multiple tabs
 * Used for page-level validation before save operations
 */
export const validateAllTabs = (
  tabValidators: Record<string, () => ValidationResult>
): ValidationResult => {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  let isValid = true;

  for (const [tabKey, validator] of Object.entries(tabValidators)) {
    try {
      const result = validator();
      if (!result.valid) {
        isValid = false;
        // Add tab context to errors
        const errorsWithContext = (result.errors || []).map(error => ({
          field: error.field || '',
          message: error.message || String(error),
          section: error.section || tabKey,
          type: error.type || 'error' as const
        }));
        allErrors.push(...errorsWithContext);
      }

      if (result.warnings) {
        const warningsWithContext = result.warnings.map(warning => ({
          field: warning.field || '',
          message: warning.message || String(warning),
          section: warning.section || tabKey,
          type: warning.type || 'warning' as const
        }));
        allWarnings.push(...warningsWithContext);
      }
    } catch (error) {
      console.error(`Validation failed for ${tabKey}:`, error);
      isValid = false;
      allErrors.push({
        field: '',
        message: `Validation error in ${tabKey}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        section: tabKey,
        type: 'error' as const
      });
    }
  }

  return {
    valid: isValid,
    errors: allErrors,
    warnings: allWarnings
  };
};

/**
 * Format validation errors for user display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';

  const errorMessages = errors.map(error => {
    const section = error.section ? `[${error.section}] ` : '';
    const field = error.field ? `${error.field}: ` : '';
    return `${section}${field}${error.message}`;
  });

  return errorMessages.join('; ');
};

/**
 * Convert legacy string[] errors to ValidationError[]
 */
export const convertStringErrorsToValidationErrors = (
  errors: string[],
  section: string = 'general'
): ValidationError[] => {
  return errors.map(error => ({
    field: '',
    message: error,
    section,
    type: 'error' as const
  }));
};

/**
 * Group validation errors by section for UI display
 */
export const groupErrorsBySection = (errors: ValidationError[]): Record<string, ValidationError[]> => {
  return errors.reduce((grouped, error) => {
    const section = error.section || 'general';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(error);
    return grouped;
  }, {} as Record<string, ValidationError[]>);
};

/**
 * Check if a section has errors
 */
export const sectionHasErrors = (errors: ValidationError[], section: string): boolean => {
  return errors.some(error => error.section === section);
};

/**
 * Check if a section has warnings
 */
export const sectionHasWarnings = (warnings: ValidationError[], section: string): boolean => {
  return warnings.some(warning => warning.section === section);
};

/**
 * Check if a specific field has validation errors
 */
export const getFieldError = (
  errors: ValidationError[],
  fieldName: string,
  section?: string
): ValidationError | null => {
  return errors.find(error =>
    error.field === fieldName && (!section || error.section === section)
  ) || null;
};
