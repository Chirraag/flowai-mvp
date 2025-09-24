// API-level types for Launchpad (combined from launchpad.types.ts and launchpad.update.types.ts)

// =============================================================================
// API RESPONSE TYPES (from original launchpad.types.ts)
// =============================================================================

export interface Organization {
  org_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AccountPerson {
  name: string;
  email: string;
  phone: string;
  title: string;
}

export interface AccountDetails {
  id: string;
  org_id: number;
  account_name: string;
  website_address: string | null;
  headquarters_address: string | null;
  decision_makers: AccountPerson[];
  influencers: AccountPerson[];
  scheduling_structure: string | null;
  rcm_structure: string | null;
  order_entry_team: AccountPerson[];
  scheduling_team: AccountPerson[];
  patient_intake_team: AccountPerson[];
  rcm_team: AccountPerson[];
  order_entry_team_size: number | null;
  scheduling_team_size: number | null;
  patient_intake_team_size: number | null;
  rcm_team_size: number | null;
  monthly_orders_count: number | null;
  monthly_patients_scheduled: number | null;
  monthly_patients_checked_in: number | null;
  emr_ris_systems: string[];
  telephony_ccas_systems: string[];
  scheduling_phone_numbers: string[];
  insurance_verification_system: string | null;
  insurance_verification_details: string | null;
  additional_info: string | null;
  clinical_notes: string | null;
  documents: unknown[];
  created_at: string;
  updated_at: string;
}


export interface Location {
  id: string; // UUID
  org_id: number;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  weekday_hours: string | null;
  weekend_hours: string | null;
  location_id: string; // business code used by speciality_services[].location_ids
  parking_directions: string | null;
  documents: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyServiceEntry {
  name: string;
  faq: string | null;
  service_information_name: string | null;
  patient_prep_requirements: string | null;
  service_information_source: string | null;
}

export interface SpecialtyService {
  id: string;
  org_id: number;
  specialty_name: string;
  location_ids: string[]; // codes like "LOC001"
  physician_names_source_type?: string | null;
  physician_names_source_name?: string | null;
  new_patients_source_type?: string | null;
  new_patients_source_name?: string | null;
  physician_locations_source_type?: string | null;
  physician_locations_source_name?: string | null;
  physician_credentials_source_type?: string | null;
  physician_credentials_source_name?: string | null;
  services: SpecialtyServiceEntry[];
  services_offered_source_type?: string | null;
  services_offered_source_name?: string | null;
  patient_prep_source_type?: string | null;
  patient_prep_source_name?: string | null;
  patient_faqs_source_type?: string | null;
  patient_faqs_source_name?: string | null;
  documents: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Insurance {
  id: string;
  org_id: number;
  accepted_payers_source: string | null;
  accepted_payers_source_details: string | null;
  insurance_verification_source: string | null;
  insurance_verification_source_details: string | null;
  patient_copay_source: string | null;
  patient_copay_source_details: string | null;
  documents: unknown[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LaunchpadFetchData {
  organization: Organization;
  account_details: AccountDetails | null;
  locations: Location[];
  speciality_services: SpecialtyService[];
  insurance: Insurance | null;
  curated_kb?: CuratedKBEntry[];
  metadata: { last_updated: string; org_id: number; user_role: string; curated_kb_count?: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Document upload/delete response types
export interface UploadedDocument {
  name: string;
  url: string;
  uploaded_at: string;
  uploaded_by: number;
}

export interface UploadDocumentResponse {
  success: boolean;
  message?: string;
  document: UploadedDocument;
}

export interface DeleteDocumentResponse {
  success: boolean;
  message?: string;
}

// Curated Knowledge Base types
export interface CuratedKBDocument {
  name: string;
  url: string;
  type: "curated_kb";
}

export interface CuratedKBEntry extends CuratedKBDocument {
  s3_key: string;
  uploaded_at: string;
  uploaded_by: number;
}

export interface CreateCuratedKBResponse {
  success: boolean;
  message?: string;
  document: CuratedKBDocument;
}

export interface DeleteCuratedKBResponse {
  success: boolean;
  message?: string;
}

// =============================================================================
// API REQUEST/UPDATE TYPES (from original launchpad.update.types.ts)
// =============================================================================

export interface PersonUpdate {
  title: string;
  name: string;
  email: string;
  phone: string;
}

export interface AccountDetailsUpdate {
  account_name: string;
  website_address: string | null;
  headquarters_address: string | null;
  decision_makers: PersonUpdate[];
  influencers: PersonUpdate[];
  scheduling_structure: string | null;
  rcm_structure: string | null;
  order_entry_team: PersonUpdate[];
  scheduling_team: PersonUpdate[];
  patient_intake_team: PersonUpdate[];
  rcm_team: PersonUpdate[];
  order_entry_team_size: number | null;
  scheduling_team_size: number | null;
  patient_intake_team_size: number | null;
  rcm_team_size: number | null;
  monthly_orders_count: number | null;
  monthly_patients_scheduled: number | null;
  monthly_patients_checked_in: number | null;
  emr_ris_systems: string[];
  telephony_ccas_systems: string[];
  scheduling_phone_numbers: string[];
  insurance_verification_system: string | null;
  insurance_verification_details: string | null;
  additional_info: string | null;
  clinical_notes: string | null;
  documents: unknown[];
}


export interface LocationUpdate {
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  weekday_hours: string | null;
  weekend_hours: string | null;
  location_id: string;
  parking_directions: string | null;
}

export interface SpecialtyServiceEntryUpdate {
  name: string;
  patient_prep_requirements?: string | null;
  faq?: string | null;
  service_information_name?: string | null;
  service_information_source?: string | null;
}

export interface SpecialityServiceUpdate {
  specialty_name: string;
  location_ids: string[]; // Required for API - managed from Specialties tab
  physician_names_source_type?: string | null;
  physician_names_source_name?: string | null;
  new_patients_source_type?: string | null;
  new_patients_source_name?: string | null;
  physician_locations_source_type?: string | null;
  physician_locations_source_name?: string | null;
  physician_credentials_source_type?: string | null;
  physician_credentials_source_name?: string | null;
  services: SpecialtyServiceEntryUpdate[];
  services_offered_source_type?: string | null;
  services_offered_source_name?: string | null;
  patient_prep_source_type?: string | null;
  patient_prep_source_name?: string | null;
  patient_faqs_source_type?: string | null;
  patient_faqs_source_name?: string | null;
  documents: unknown[];
}

export interface InsuranceUpdate {
  accepted_payers_source?: string | null;
  accepted_payers_source_details?: string | null;
  accepted_payers_source_link?: string | null;
  insurance_verification_source?: string | null;
  insurance_verification_source_details?: string | null;
  insurance_verification_source_link?: string | null;
  patient_copay_source?: string | null;
  patient_copay_source_details?: string | null;
  patient_copay_source_link?: string | null;
  documents?: unknown[];
  is_active: boolean;
}

// Request wrapper types
export interface UpdateAccountDetailsRequest {
  data: AccountDetailsUpdate;
}

export interface UpdateLocationsRequest {
  locations: LocationUpdate[];
}

export interface UpdateSpecialtiesRequest {
  speciality_services: SpecialityServiceUpdate[];
}

export interface UpdateInsuranceRequest {
  insurance: InsuranceUpdate;
}

// Response types
export interface UpdateResponse {
  success: boolean;
  message?: string;
}


