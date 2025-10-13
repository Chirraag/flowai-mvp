/**
 * Shared type definitions for AI Agents
 * Common interfaces used across all agent pages
 * Contains only types that are truly shared and don't belong to specific modules
 */

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  section: string;
  type: 'error' | 'warning';
}

/**
 * Base interface for AI Agent page props
 */
export interface BaseAgentPageProps {
  orgId?: string;
  readOnly?: boolean;
}

/**
 * Common tab component interface
 */
export interface BaseTabComponentProps<T = any> {
  values: T;
  onChange: (values: T) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
}

/**
 * Tab handle interface for ref-based components
 */
export interface BaseTabHandle {
  getValues: () => any;
  validate: () => ValidationResult;
}

/**
 * Common change handler type
 */
export type ChangeHandler<T> = (values: T) => void;

/**
 * Common save handler type
 */
export type SaveHandler = () => Promise<void>;
