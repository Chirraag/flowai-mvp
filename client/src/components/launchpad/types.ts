export type Person = {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];


export type OrgLocation = {
  id: string; // UI local id
  location_id: string; // External ID like LOC001
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  zip_code: string;
  weekday_hours: string;
  weekend_hours: string;
  specialties_text?: string; // Free text specialties
  services_text?: string; // Free text services
  parking_directions: string;
  is_active: boolean;
};

export type SpecialtyServiceEntry = {
  name: string;
  patient_prep_requirements?: string;
  faq?: string;
  service_information_name?: string | null;
  service_information_source?: string | null;
};

export type ServiceInformationSource = "EMR" | "Website" | "Clinical Guidelines" | "Department Protocol" | "Other";

export type AccountOpportunitySizing = {
  monthly_orders_count?: number;
  monthly_patients_scheduled?: number;
  monthly_patients_checked_in?: number;
};

export type OrgSpecialityService = {
  id: string; // UI local id
  specialty_name: string;
  location_names_text?: string; // Free text location names
  location_ids: string[]; // references OrgLocation.location_id
  physician_names_source_type?: string | null;
  physician_names_source_name?: string | null;
  physician_names_source_link?: string | null;
  new_patients_source_type?: string | null;
  new_patients_source_name?: string | null;
  new_patients_source_link?: string | null;
  physician_locations_source_type?: string | null;
  physician_locations_source_name?: string | null;
  physician_locations_source_link?: string | null;
  physician_credentials_source_type?: string | null;
  physician_credentials_source_name?: string | null;
  physician_credentials_source_link?: string | null;
  services: SpecialtyServiceEntry[];
  services_offered_source_type?: string | null;
  services_offered_source_name?: string | null;
  services_offered_source_link?: string | null;
  patient_prep_source_type?: string | null;
  patient_prep_source_name?: string | null;
  patient_prep_source_link?: string | null;
  patient_faqs_source_type?: string | null;
  patient_faqs_source_name?: string | null;
  patient_faqs_source_link?: string | null;
  is_active: boolean;
};

export type OrgInsurance = {
  accepted_payers_source?: string | null;
  accepted_payers_source_details?: string | null;
  accepted_payers_source_link?: string | null;
  insurance_verification_source?: string | null;
  insurance_verification_source_details?: string | null;
  insurance_verification_source_link?: string | null;
  patient_copay_source?: string | null;
  patient_copay_source_details?: string | null;
  patient_copay_source_link?: string | null;
  is_active: boolean;
};


