import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationError } from "@/lib/launchpad.utils";

interface ValidationStatusProps {
  status: 'valid' | 'invalid' | 'warning' | 'neutral' | 'validating';
  className?: string;
}

export function ValidationStatus({ status, className }: ValidationStatusProps) {
  const getIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'validating':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {getIcon()}
    </div>
  );
}

interface EnhancedFieldErrorProps {
  error?: ValidationError;
  warning?: ValidationError;
  className?: string;
  showIcon?: boolean;
  showSuggestion?: boolean;
}

export function EnhancedFieldError({
  error,
  warning,
  className,
  showIcon = true,
  showSuggestion = true
}: EnhancedFieldErrorProps) {
  const validationItem = error || warning;

  if (!validationItem) return null;

  const isError = validationItem.severity === 'error';
  const isWarning = validationItem.severity === 'warning';

  return (
    <div className={cn(
      "flex items-start gap-2 text-sm mt-1",
      isError ? "text-red-800" : isWarning ? "text-yellow-800" : "text-blue-800",
      className
    )}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {isError && <AlertCircle className="h-3 w-3" />}
          {isWarning && <AlertTriangle className="h-3 w-3" />}
          {validationItem.severity === 'info' && <Info className="h-3 w-3" />}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{validationItem.message}</p>
        {showSuggestion && validationItem.suggestion && (
          <p className="text-xs opacity-75 mt-0.5">{validationItem.suggestion}</p>
        )}
      </div>
    </div>
  );
}

interface SectionErrorSummaryProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  sectionName: string;
  className?: string;
  onDismiss?: () => void;
}

export function SectionErrorSummary({
  errors,
  warnings,
  sectionName,
  className,
  onDismiss
}: SectionErrorSummaryProps) {
  const sectionErrors = errors.filter(e => e.section === sectionName);
  const sectionWarnings = warnings.filter(w => w.section === sectionName);

  if (sectionErrors.length === 0 && sectionWarnings.length === 0) return null;

  return (
    <div className={cn(
      "rounded-md border p-3 mb-4",
      sectionErrors.length > 0 ? "border-red-200 bg-red-50/50" : "border-yellow-200 bg-yellow-50/50",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {sectionErrors.length > 0 ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              {sectionName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <div className="space-y-1">
              {sectionErrors.map((error, index) => (
                <p key={`error-${index}`} className="text-sm text-red-800">
                  • {error.message}
                </p>
              ))}
              {sectionWarnings.map((warning, index) => (
                <p key={`warning-${index}`} className="text-sm text-yellow-800">
                  • {warning.message}
                </p>
              ))}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded"
            aria-label="Dismiss errors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface FormValidationSummaryProps {
  errors: ValidationError[];
  warnings: ValidationError[];
  className?: string;
  title?: string;
  showSectionBreakdown?: boolean;
}

export function FormValidationSummary({
  errors,
  warnings,
  className,
  title = "Please review the following issues:",
  showSectionBreakdown = true
}: FormValidationSummaryProps) {
  if (errors.length === 0 && warnings.length === 0) return null;

  const groupedErrors = errors.reduce((acc, error) => {
    const section = error.section || 'general';
    if (!acc[section]) acc[section] = { errors: [], warnings: [] };
    acc[section].errors.push(error);
    return acc;
  }, {} as Record<string, { errors: ValidationError[]; warnings: ValidationError[] }>);

  const groupedWarnings = warnings.reduce((acc, warning) => {
    const section = warning.section || 'general';
    if (!acc[section]) acc[section] = { errors: [], warnings: [] };
    acc[section].warnings.push(warning);
    return acc;
  }, {} as Record<string, { errors: ValidationError[]; warnings: ValidationError[] }>);

  const allGrouped = { ...groupedErrors, ...groupedWarnings };
  Object.keys(groupedWarnings).forEach(section => {
    if (!allGrouped[section]) allGrouped[section] = { errors: [], warnings: [] };
    allGrouped[section].warnings = groupedWarnings[section].warnings;
  });

  return (
    <div className={cn(
      "rounded-md border border-red-200 bg-red-50/50 p-4",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <h4 className="text-sm font-medium text-red-900">{title}</h4>
      </div>

      {showSectionBreakdown ? (
        <div className="space-y-3">
          {Object.entries(allGrouped).map(([section, { errors: sectionErrors, warnings: sectionWarnings }]) => (
            <div key={section} className="border-l-2 border-red-200 pl-3">
              <h5 className="text-sm font-medium text-red-800 mb-1">
                {section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h5>
              <ul className="space-y-1">
                {sectionErrors.map((error, index) => (
                  <li key={`error-${index}`} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
                {sectionWarnings.map((warning, index) => (
                  <li key={`warning-${index}`} className="text-sm text-yellow-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
          {errors.map((error, index) => (
            <li key={`error-${index}`}>{error.message}</li>
          ))}
          {warnings.map((warning, index) => (
            <li key={`warning-${index}`} className="text-yellow-700">{warning.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ValidationInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationStatus?: 'valid' | 'invalid' | 'warning' | 'neutral' | 'validating';
  error?: ValidationError;
  warning?: ValidationError;
  showValidationIcon?: boolean;
  showErrorMessage?: boolean;
  showSuggestion?: boolean;
}

export const ValidationInput = React.forwardRef<HTMLInputElement, ValidationInputProps>(
  ({
    validationStatus = 'neutral',
    error,
    warning,
    showValidationIcon = true,
    showErrorMessage = true,
    showSuggestion = true,
    className,
    ...props
  }, ref) => {
    const getInputClasses = () => {
      const baseClasses = "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

      switch (validationStatus) {
        case 'valid':
          return `${baseClasses} border-green-300 focus-visible:ring-green-500 bg-green-50/30`;
        case 'invalid':
          return `${baseClasses} border-red-300 focus-visible:ring-red-500 bg-red-50/30`;
        case 'warning':
          return `${baseClasses} border-yellow-300 focus-visible:ring-yellow-500 bg-yellow-50/30`;
        case 'validating':
          return `${baseClasses} border-blue-300 focus-visible:ring-blue-500`;
        default:
          return `${baseClasses} border-input`;
      }
    };

    return (
      <div className="space-y-1">
        <div className="relative">
          <input
            ref={ref}
            className={getInputClasses()}
            {...props}
          />
          {showValidationIcon && validationStatus !== 'neutral' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationStatus status={validationStatus} />
            </div>
          )}
        </div>
        {showErrorMessage && (
          <EnhancedFieldError
            error={error}
            warning={warning}
            showSuggestion={showSuggestion}
          />
        )}
      </div>
    );
  }
);

ValidationInput.displayName = "ValidationInput";
