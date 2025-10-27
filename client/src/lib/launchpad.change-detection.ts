import { useMemo } from 'react';
import type { AccountDetails } from '@/lib/launchpad.types';
import type { OrgLocation, OrgSpecialityService, OrgInsurance } from '@/components/launchpad/types';

// Helper to normalize values for comparison (treat undefined as null)
const normalizeForComparison = (value: number | null | undefined): number | null => {
  return value === undefined ? null : value;
};

// Shallow equality check for arrays and objects
function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;

    // For arrays of primitives
    if (obj1.every(item => typeof item !== 'object')) {
      return obj1.every((item, idx) => item === obj2[idx]);
    }

    // For arrays of objects, compare by ID if available
    return obj1.every((item, idx) => {
      const item2 = obj2[idx];
      if (item?.id && item2?.id) {
        return item.id === item2.id;
      }
      return item === item2;
    });
  }

  // Handle objects
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => obj1[key] === obj2[key]);
  }

  return false;
}

export function useAccountChangeDetection(
  typedDataAccount: AccountDetails | null,
  state: {
    accountName: string;
    websiteAddress: string;
    headquartersAddress: string;
    schedulingStructure: string;
    rcmStructure: string;
    orderEntryTeamSize: number | undefined;
    schedulingTeamSize: number | undefined;
    patientIntakeTeamSize: number | undefined;
    rcmTeamSize: number | undefined;
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
    decisionMakers: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
    influencers: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
    orderEntryTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
    schedulingTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
    patientIntakeTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
    rcmTeam: Array<{ id: string; title: string; name: string; email: string; phone: string }>;
  }
): boolean {
  return useMemo(() => {
    if (!typedDataAccount) return false;

    const ad = typedDataAccount;

    // Basic fields
    if (state.accountName !== (ad.account_name ?? "")) return true;
    if (state.websiteAddress !== (ad.website_address ?? "")) return true;
    if (state.headquartersAddress !== (ad.headquarters_address ?? "")) return true;
    if (state.schedulingStructure !== (ad.scheduling_structure ?? "")) return true;
    if (state.rcmStructure !== (ad.rcm_structure ?? "")) return true;

    // Team sizes
    if (state.orderEntryTeamSize !== (ad.order_entry_team_size ?? undefined)) return true;
    if (state.schedulingTeamSize !== (ad.scheduling_team_size ?? undefined)) return true;
    if (state.patientIntakeTeamSize !== (ad.patient_intake_team_size ?? undefined)) return true;
    if (state.rcmTeamSize !== (ad.rcm_team_size ?? undefined)) return true;

    // Opportunity sizing - compare normalized values directly
    if (normalizeForComparison(state.opportunitySizing.monthly_orders_count) !== normalizeForComparison(ad.monthly_orders_count)) return true;
    if (normalizeForComparison(state.opportunitySizing.monthly_patients_scheduled) !== normalizeForComparison(ad.monthly_patients_scheduled)) return true;
    if (normalizeForComparison(state.opportunitySizing.monthly_patients_checked_in) !== normalizeForComparison(ad.monthly_patients_checked_in)) return true;

    // Arrays - use shallow comparison
    if (!shallowEqual(state.emrSystems, ad.emr_ris_systems || [])) return true;
    if (!shallowEqual(state.telephonySystems, ad.telephony_ccas_systems || [])) return true;
    if (!shallowEqual(state.schedulingPhoneNumbers, ad.scheduling_phone_numbers || [])) return true;

    // System fields
    if (state.insuranceVerificationSystem !== (ad.insurance_verification_system ?? "")) return true;
    if (state.insuranceVerificationDetails !== (ad.insurance_verification_details ?? "")) return true;
    if (state.additionalInfo !== (ad.additional_info ?? "")) return true;
    if (state.clinicalNotes !== (ad.clinical_notes ?? "")) return true;

    // People arrays - compare by ID and fields
    const peopleArrays = [
      { current: state.decisionMakers, original: ad.decision_makers },
      { current: state.influencers, original: ad.influencers },
      { current: state.orderEntryTeam, original: ad.order_entry_team },
      { current: state.schedulingTeam, original: ad.scheduling_team },
      { current: state.patientIntakeTeam, original: ad.patient_intake_team },
      { current: state.rcmTeam, original: ad.rcm_team },
    ];

    for (const { current, original } of peopleArrays) {
      if (current.length !== (original || []).length) return true;
      for (let i = 0; i < current.length; i++) {
        const curr = current[i];
        const orig = (original || [])[i];
        if (!orig ||
            curr.title !== (orig.title || "") ||
            curr.name !== (orig.name || "") ||
            curr.email !== (orig.email || "") ||
            curr.phone !== (orig.phone || "")) return true;
      }
    }

    return false;
  }, [
    typedDataAccount,
    state.accountName,
    state.websiteAddress,
    state.headquartersAddress,
    state.schedulingStructure,
    state.rcmStructure,
    state.orderEntryTeamSize,
    state.schedulingTeamSize,
    state.patientIntakeTeamSize,
    state.rcmTeamSize,
    state.opportunitySizing,
    state.emrSystems,
    state.telephonySystems,
    state.schedulingPhoneNumbers,
    state.insuranceVerificationSystem,
    state.insuranceVerificationDetails,
    state.additionalInfo,
    state.clinicalNotes,
    state.decisionMakers,
    state.influencers,
    state.orderEntryTeam,
    state.schedulingTeam,
    state.patientIntakeTeam,
    state.rcmTeam,
  ]);
}

// Specialized hook for array change detection with ID tracking
export function useArrayChangeDetection<T extends { id: string }>(
  original: T[],
  current: T[],
  customCompare?: (a: T, b: T) => boolean
): boolean {
  return useMemo(() => {
    if (original.length !== current.length) return true;

    // Create maps for O(1) lookup
    const originalMap = new Map(original.map(item => [item.id, item]));
    const currentMap = new Map(current.map(item => [item.id, item]));

    // Check if any IDs are different
    const originalIds = new Set(originalMap.keys());
    const currentIds = new Set(currentMap.keys());

    if (originalIds.size !== currentIds.size) return true;

    // Check if any items with same ID have different properties
    for (const id of Array.from(currentIds)) {
      if (!originalIds.has(id)) return true;

      const originalItem = originalMap.get(id);
      const currentItem = currentMap.get(id);

      if (customCompare) {
        if (!customCompare(originalItem!, currentItem!)) return true;
      } else {
        if (!shallowEqual(originalItem, currentItem)) return true;
      }
    }

    return false;
  }, [original, current, customCompare]);
}

// Specialized hook for comparing API arrays with UI arrays
export function useMixedArrayChangeDetection<TApi extends { id: string }, TUi extends { id: string }>(
  apiArray: TApi[],
  uiArray: TUi[],
  compareFn: (apiItem: TApi, uiItem: TUi) => boolean
): boolean {
  return useMemo(() => {
    if (apiArray.length !== uiArray.length) return true;

    // Create maps for O(1) lookup
    const apiMap = new Map(apiArray.map(item => [item.id, item]));
    const uiMap = new Map(uiArray.map(item => [item.id, item]));

    // Check if any IDs are different
    const apiIds = new Set(apiMap.keys());
    const uiIds = new Set(uiMap.keys());

    if (apiIds.size !== uiIds.size) return true;

    // Check if any items with same ID have different properties
    for (const id of Array.from(uiIds)) {
      if (!apiIds.has(id)) return true;

      const apiItem = apiMap.get(id);
      const uiItem = uiMap.get(id);

      if (!compareFn(apiItem!, uiItem!)) return true;
    }

    return false;
  }, [apiArray, uiArray, compareFn]);
}

// Custom comparison for Location (API) vs OrgLocation (UI)
function compareLocation(apiLoc: any, uiLoc: OrgLocation): boolean {
  return (
    uiLoc.name === apiLoc.name &&
    uiLoc.location_id === apiLoc.location_id &&
    uiLoc.address_line1 === (apiLoc.address_line1 ?? "") &&
    uiLoc.address_line2 === apiLoc.address_line2 &&
    uiLoc.city === (apiLoc.city ?? "") &&
    uiLoc.state === (apiLoc.state ?? "") &&
    uiLoc.zip_code === (apiLoc.zip_code ?? "") &&
    uiLoc.weekday_hours === (apiLoc.weekday_hours ?? "") &&
    uiLoc.weekend_hours === (apiLoc.weekend_hours ?? "") &&
    uiLoc.parking_directions === (apiLoc.parking_directions ?? "") &&
    uiLoc.is_active === !!apiLoc.is_active
  );
}

// Custom comparison for SpecialtyService (API) vs OrgSpecialityService (UI)
function compareSpecialty(apiSpec: any, uiSpec: OrgSpecialityService): boolean {
  // Compare basic fields
  if (
    uiSpec.specialty_name !== (apiSpec.specialty_name ?? "") ||
    !shallowEqual(uiSpec.location_ids.sort(), (apiSpec.location_ids || []).sort()) ||
    uiSpec.physician_names_source_type !== (apiSpec.physician_names_source_type ?? null) ||
    uiSpec.physician_names_source_name !== (apiSpec.physician_names_source_name ?? null) ||
    uiSpec.new_patients_source_type !== (apiSpec.new_patients_source_type ?? null) ||
    uiSpec.new_patients_source_name !== (apiSpec.new_patients_source_name ?? null) ||
    uiSpec.physician_locations_source_type !== (apiSpec.physician_locations_source_type ?? null) ||
    uiSpec.physician_locations_source_name !== (apiSpec.physician_locations_source_name ?? null) ||
    uiSpec.physician_credentials_source_type !== (apiSpec.physician_credentials_source_type ?? null) ||
    uiSpec.physician_credentials_source_name !== (apiSpec.physician_credentials_source_name ?? null) ||
    uiSpec.services_offered_source_type !== (apiSpec.services_offered_source_type ?? null) ||
    uiSpec.services_offered_source_name !== (apiSpec.services_offered_source_name ?? null) ||
    uiSpec.patient_prep_source_type !== (apiSpec.patient_prep_source_type ?? null) ||
    uiSpec.patient_prep_source_name !== (apiSpec.patient_prep_source_name ?? null) ||
    uiSpec.patient_faqs_source_type !== (apiSpec.patient_faqs_source_type ?? null) ||
    uiSpec.patient_faqs_source_name !== (apiSpec.patient_faqs_source_name ?? null) ||
    uiSpec.is_active !== !!apiSpec.is_active
  ) {
    return false;
  }

  // Compare services array
  const apiServices = apiSpec.services || [];
  if (uiSpec.services.length !== apiServices.length) return false;

  for (let j = 0; j < uiSpec.services.length; j++) {
    const uiSvc = uiSpec.services[j];
    const apiSvc = apiServices[j];
    if (!apiSvc ||
        uiSvc.name !== (apiSvc.name ?? "") ||
        uiSvc.patient_prep_requirements !== (apiSvc.patient_prep_requirements ?? "") ||
        uiSvc.faq !== (apiSvc.faq ?? "") ||
        uiSvc.service_information_name !== (apiSvc.service_information_name ?? null) ||
        uiSvc.service_information_source !== (apiSvc.service_information_source ?? null)) {
      return false;
    }
  }

  return true;
}

// Hook for insurance change detection
export function useInsuranceChangeDetection(
  originalInsurance: OrgInsurance | null,
  currentInsurance: OrgInsurance
): boolean {
  return useMemo(() => {
    if (!originalInsurance) return false;

    return currentInsurance.accepted_payers_source !== (originalInsurance.accepted_payers_source ?? "") ||
           currentInsurance.accepted_payers_source_details !== (originalInsurance.accepted_payers_source_details ?? "") ||
           currentInsurance.insurance_verification_source !== (originalInsurance.insurance_verification_source ?? "") ||
           currentInsurance.insurance_verification_source_details !== (originalInsurance.insurance_verification_source_details ?? "") ||
           currentInsurance.patient_copay_source !== (originalInsurance.patient_copay_source ?? "") ||
           currentInsurance.patient_copay_source_details !== (originalInsurance.patient_copay_source_details ?? "") ||
           currentInsurance.is_active !== !!originalInsurance.is_active;
  }, [originalInsurance, currentInsurance]);
}
