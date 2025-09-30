const API_BASE_URL = 'https://api.myflowai.com/api/v1';

export interface IntakeOrganization {
  orgId: number;
  orgName: string;
  logoUrl: string;
  speciality: string;
}

export interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  validation?: string;
  placeholder?: string;
  rows?: number;
  options?: Array<{ label: string; value: string }>;
  conditional?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface IntakeForm {
  formTitle: string;
  speciality: string;
  sections: FormSection[];
  metadata: {
    version: string;
    formType: string;
    createdBy: string;
    lastUpdated: string;
  };
}

export interface IntakeData {
  requestId: number;
  status: 'in_progress' | 'pending' | 'completed' | 'expired';
  patientId: string;
  organization: IntakeOrganization;
  intakeForm: IntakeForm;
  createdAt: string;
  expiresAt: string;
  hoursRemaining: string;
}

export interface IntakeResponse {
  success: boolean;
  data: IntakeData;
}

export interface VerifyPatientRequest {
  date_of_birth: string;
  first_name: string;
  last_name: string;
}

export interface VerifyPatientResponse {
  success: boolean;
  verified: boolean;
  message: string;
}

export async function fetchIntakeData(hash: string): Promise<IntakeResponse> {
  const response = await fetch(`${API_BASE_URL}/intake/${hash}`);

  if (!response.ok) {
    throw new Error('Failed to fetch intake data');
  }

  return response.json();
}

export async function verifyPatient(
  hash: string,
  data: VerifyPatientRequest
): Promise<VerifyPatientResponse> {
  const response = await fetch(`${API_BASE_URL}/intake/${hash}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to verify patient');
  }

  return response.json();
}