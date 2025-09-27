import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export function formatTime(time: string) {
  return time;
}

export function getPatientInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}

export function getProviderFullName(firstName: string, lastName: string) {
  return `Dr. ${firstName} ${lastName}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'checked-in':
      return 'bg-green-100 text-green-800';
    case 'arriving':
      return 'bg-yellow-100 text-yellow-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'rescheduled':
      return 'bg-red-100 text-red-800';
    case 'canceled':
      return 'bg-gray-100 text-gray-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getFormattedStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getAvailableTimeSlots(date: Date) {
  // In a real application, this would fetch available time slots from the server
  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];
  
  return timeSlots;
}

export function generatePatientNumber() {
  const prefix = 'PAT-';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomNum}`;
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// RBAC Error Handling Utilities
export interface ErrorHandlerOptions {
  action?: string; // e.g., "save specialties", "add member", "update settings"
  fallbackMessage?: string;
}

export function handleApiError(error: unknown, options: ErrorHandlerOptions = {}) {
  const { action = "perform this action", fallbackMessage } = options;
  
  // Handle ApiError with status code
  if (error instanceof Error && 'status' in error) {
    const apiError = error as any;
    
    if (apiError.status === 403) {
      return {
        title: "Permission Denied",
        description: apiError.message || `You don't have permission to ${action}. Contact your administrator for access.`,
        variant: "destructive" as const,
      };
    }
    
    if (apiError.status === 401) {
      return {
        title: "Authentication Required",
        description: "Your session has expired. Please log in again.",
        variant: "destructive" as const,
      };
    }
    
    if (apiError.status >= 500) {
      return {
        title: "Server Error",
        description: "A server error occurred. Please try again later.",
        variant: "destructive" as const,
      };
    }
  }
  
  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : fallbackMessage || `Failed to ${action}. Please try again.`;
  
  return {
    title: "Error",
    description: errorMessage,
    variant: "destructive" as const,
  };
}