import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSummary } from "@/components/ui/form-error";
import { FormValidationSummary, SectionErrorSummary } from "@/components/ui/validation-components";
import { ContextualHelp } from "@/components/ui/breadcrumb-nav";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AccountOverviewCard from "@/components/launchpad/account/AccountOverviewCard";
import DecisionMakersCard from "@/components/launchpad/account/DecisionMakersCard";
import InfluencersCard from "@/components/launchpad/account/InfluencersCard";
import TeamReportingSection from "@/components/launchpad/account/TeamReportingSection";
import TeamSizesCard from "@/components/launchpad/account/TeamSizesCard";
import SystemsIntegrationCard from "@/components/launchpad/account/SystemsIntegrationCard";
import OrgStructureCard from "@/components/launchpad/account/OrgStructureCard";
import OpportunitySizingCard from "@/components/launchpad/account/OpportunitySizingCard";
import LocationsModule from "@/components/launchpad/locations/LocationsModule";
import SpecialtiesModule from "@/components/launchpad/specialties/SpecialtiesModule";
import InsuranceModule from "@/components/launchpad/insurance/InsuranceModule";
import KnowledgeModule from "@/components/launchpad/knowledge/KnowledgeModule";
import { OrgInsurance, OrgLocation, OrgSpecialityService, AccountOpportunitySizing } from "@/components/launchpad/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useLaunchpadData,
  useUpdateAccountDetails,
  useUpdateLocations,
  useUpdateSpecialties,
  useUpdateInsurance,
  useUploadAccountDocument,
  useDeleteAccountDocument,
  useUploadLocationsDocument,
  useDeleteLocationsDocument,
  useUploadSpecialtiesDocument,
  useDeleteSpecialtiesDocument,
  useUploadInsuranceDocument,
  useDeleteInsuranceDocument,
  useCreateCuratedKB,
  useDeleteCuratedKB
} from "@/lib/launchpad.api";
import type { LaunchpadFetchData } from "@/lib/launchpad.types";
import { useQueryClient } from "@tanstack/react-query";
import { makeLocationCodeMap, makeLocationOptions } from "@/lib/launchpad.utils";
import {
  mapAccountUIToApi,
  mapLocationsUIToApi,
  mapSpecialtiesUIToApi,
  mapInsuranceUIToApi,
  computeLocationIdChanges,
  applyLocationCodeRenamesToSpecialties
} from "@/lib/launchpad.utils";
import {
  validateAccountData,
  validateLocationsData,
  validateSpecialtiesData,
  validateInsuranceData,
  formatValidationErrors,
  groupErrorsBySection,
  getFieldError,
  sectionHasErrors,
  sectionHasWarnings,
  validateField,
  type ValidationResult,
  type ValidationError
} from "@/lib/launchpad.utils";
import DocumentUpload from "@/components/launchpad/shared/DocumentUpload";
import { getDocumentsForTab, getDocumentTitle } from "@/lib/launchpad.utils";
import { handleApiError } from "@/lib/utils";
import ScrollToTopButton from "@/components/ui/scroll-to-top";

type Person = {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
};

export default function Launchpad() {
  const { user, isLoading: authLoading, hasWriteAccess } = useAuth();
  const { toast } = useToast();
  
  // RBAC Permission check for save button visibility
  const canWriteLaunchpad = hasWriteAccess("launchpad");
  const queryClient = useQueryClient();
  const { orgId: urlOrgId } = useParams<{ orgId: string }>();
  
  // Derive orgId from URL params (most reliable source) and convert to number
  const orgId = urlOrgId ? parseInt(urlOrgId, 10) : undefined;
  
  const { data, isLoading, isError, refetch } = useLaunchpadData(orgId, !!orgId && !authLoading);
  
  // Type assertion to help TypeScript understand the data structure
  const typedData = data as LaunchpadFetchData | undefined;

  // Update mutations
  const updateAccountDetails = useUpdateAccountDetails(orgId);
  const updateLocations = useUpdateLocations(orgId);
  const updateSpecialties = useUpdateSpecialties(orgId);
  const updateInsurance = useUpdateInsurance(orgId);

  // Document mutations
  const uploadAccountDocument = useUploadAccountDocument(orgId);
  const deleteAccountDocument = useDeleteAccountDocument(orgId);
  const uploadLocationsDocument = useUploadLocationsDocument(orgId);
  const deleteLocationsDocument = useDeleteLocationsDocument(orgId);
  const uploadSpecialtiesDocument = useUploadSpecialtiesDocument(orgId);
  const deleteSpecialtiesDocument = useDeleteSpecialtiesDocument(orgId);
  const uploadInsuranceDocument = useUploadInsuranceDocument(orgId);
  const deleteInsuranceDocument = useDeleteInsuranceDocument(orgId);

  // Debug logging
  console.log('Launchpad Debug:', {
    user: user ? { org_id: user.org_id, workspaceId: user.workspaceId } : null,
    orgId,
    authLoading,
    data: data ? 'Data received' : 'No data',
    isLoading,
    isError,
    queryEnabled: !!orgId && !authLoading
  });

  // Debug log when orgId changes
  useEffect(() => {
    console.log('Launchpad: orgId changed to:', orgId);
  }, [orgId]);
  // Account Overview
  const [accountName, setAccountName] = useState("");
  const [websiteAddress, setWebsiteAddress] = useState("");
  const [headquartersAddress, setHeadquartersAddress] = useState("");

  // People
  const [decisionMakers, setDecisionMakers] = useState<Person[]>([]);
  const [influencers, setInfluencers] = useState<Person[]>([]);

  // Team Reporting
  const [orderEntryTeam, setOrderEntryTeam] = useState<Person[]>([]);
  const [schedulingTeam, setSchedulingTeam] = useState<Person[]>([]);
  const [patientIntakeTeam, setPatientIntakeTeam] = useState<Person[]>([]);
  const [rcmTeam, setRcmTeam] = useState<Person[]>([]);

  // Team Sizes
  const [orderEntryTeamSize, setOrderEntryTeamSize] = useState<number | undefined>(undefined);
  const [schedulingTeamSize, setSchedulingTeamSize] = useState<number | undefined>(undefined);
  const [patientIntakeTeamSize, setPatientIntakeTeamSize] = useState<number | undefined>(undefined);
  const [rcmTeamSize, setRcmTeamSize] = useState<number | undefined>(undefined);

  // Systems Integration
  const [emrSystems, setEmrSystems] = useState<string[]>([]);
  const [telephonySystems, setTelephonySystems] = useState<string[]>([]);
  const [schedulingPhoneNumbers, setSchedulingPhoneNumbers] = useState<string[]>([]);
  const [insuranceVerificationSystem, setInsuranceVerificationSystem] = useState("");
  const [insuranceVerificationDetails, setInsuranceVerificationDetails] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");

  // Org Structure
  const [schedulingStructure, setSchedulingStructure] = useState("");
  const [rcmStructure, setRcmStructure] = useState("");

  // Opportunity Sizing
  const [opportunitySizing, setOpportunitySizing] = useState<AccountOpportunitySizing>({});

  // Team Reporting (single contacts)
  const [orderEntryTeamReporting, setOrderEntryTeamReporting] = useState<Person | undefined>(undefined);
  const [schedulingTeamReporting, setSchedulingTeamReporting] = useState<Person | undefined>(undefined);
  const [patientIntakeTeamReporting, setPatientIntakeTeamReporting] = useState<Person | undefined>(undefined);
  const [rcmTeamReporting, setRcmTeamReporting] = useState<Person | undefined>(undefined);

  // Systems Integration updates

  // Locations (hydrated from API snapshot)
  const [locations, setLocations] = useState<OrgLocation[]>([]);

  // Enhanced form validation state
  const [formValidation, setFormValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    hasErrors: false,
    hasWarnings: false,
  });

  // Real-time validation state for individual fields
  const [fieldValidations, setFieldValidations] = useState<Record<string, ValidationError | null>>({});

  // Specialties (hydrated from API snapshot)
  const [specialties, setSpecialties] = useState<OrgSpecialityService[]>([]);

  // Insurance (hydrated from API snapshot)
  const [insurance, setInsurance] = useState<OrgInsurance>({ is_active: true });

  // Tab management
  const [activeTab, setActiveTab] = useState("account");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<string | null>(null);

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = useState<Record<string, boolean>>({});

  // Scroll-aware header state
  const [isScrolled, setIsScrolled] = useState(false);

  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    personId?: string;
    personName?: string;
    setter?: React.Dispatch<React.SetStateAction<Person[]>>;
  }>({ open: false });

  // Unsaved changes dialog state
  const [unsavedChangesDialog, setUnsavedChangesDialog] = useState<{
    open: boolean;
  }>({ open: false });

  const previousOrgIdRef = useRef<number | undefined>(undefined);

  const resetLaunchpadState = () => {
    setAccountName("");
    setWebsiteAddress("");
    setHeadquartersAddress("");
    setDecisionMakers([]);
    setInfluencers([]);
    setOrderEntryTeam([]);
    setSchedulingTeam([]);
    setPatientIntakeTeam([]);
    setRcmTeam([]);
    setOrderEntryTeamSize(undefined);
    setSchedulingTeamSize(undefined);
    setPatientIntakeTeamSize(undefined);
    setRcmTeamSize(undefined);
    setEmrSystems([]);
    setTelephonySystems([]);
    setSchedulingPhoneNumbers([]);
    setInsuranceVerificationSystem("");
    setInsuranceVerificationDetails("");
    setAdditionalInfo("");
    setClinicalNotes("");
    setSchedulingStructure("");
    setRcmStructure("");
    setOpportunitySizing({});
    setOrderEntryTeamReporting(undefined);
    setSchedulingTeamReporting(undefined);
    setPatientIntakeTeamReporting(undefined);
    setRcmTeamReporting(undefined);
    setLocations([]);
    setFormValidation({
      isValid: true,
      errors: [],
      warnings: [],
      hasErrors: false,
      hasWarnings: false,
    });
    setFieldValidations({});
    setSpecialties([]);
    setInsurance({ is_active: true });
    setHasUnsavedChanges(false);
    originalLocationsRef.current = [];
    originalSpecialtiesRef.current = [];
  };

  // Function to detect if there are unsaved changes
  const checkForUnsavedChanges = useCallback(() => {
    if (!typedData) return false;

    const ad = typedData.account_details;

    // Helper to normalize values for comparison (treat undefined as null)
    const normalizeForComparison = (value: number | null | undefined): number | null => {
      return value === undefined ? null : value;
    };

    // Check account details
    if (ad) {
      if (accountName !== (ad.account_name ?? "")) return true;
      if (websiteAddress !== (ad.website_address ?? "")) return true;
      if (headquartersAddress !== (ad.headquarters_address ?? "")) return true;
      if (schedulingStructure !== (ad.scheduling_structure ?? "")) return true;
      if (rcmStructure !== (ad.rcm_structure ?? "")) return true;
      if (orderEntryTeamSize !== (ad.order_entry_team_size ?? undefined)) return true;
      if (schedulingTeamSize !== (ad.scheduling_team_size ?? undefined)) return true;
      if (patientIntakeTeamSize !== (ad.patient_intake_team_size ?? undefined)) return true;
      if (rcmTeamSize !== (ad.rcm_team_size ?? undefined)) return true;

      // Check opportunity sizing
      const currentOpp = {
        monthly_orders_count: normalizeForComparison(opportunitySizing.monthly_orders_count),
        monthly_patients_scheduled: normalizeForComparison(opportunitySizing.monthly_patients_scheduled),
        monthly_patients_checked_in: normalizeForComparison(opportunitySizing.monthly_patients_checked_in),
      };
      const originalOpp = {
        monthly_orders_count: normalizeForComparison(ad.monthly_orders_count),
        monthly_patients_scheduled: normalizeForComparison(ad.monthly_patients_scheduled),
        monthly_patients_checked_in: normalizeForComparison(ad.monthly_patients_checked_in),
      };
      if (JSON.stringify(currentOpp) !== JSON.stringify(originalOpp)) return true;

      // Check arrays
      if (JSON.stringify(emrSystems) !== JSON.stringify(ad.emr_ris_systems || [])) return true;
      if (JSON.stringify(telephonySystems) !== JSON.stringify(ad.telephony_ccas_systems || [])) return true;
      if (JSON.stringify(schedulingPhoneNumbers) !== JSON.stringify(ad.scheduling_phone_numbers || [])) return true;
      if (insuranceVerificationSystem !== (ad.insurance_verification_system ?? "")) return true;
      if (insuranceVerificationDetails !== (ad.insurance_verification_details ?? "")) return true;
      if (additionalInfo !== (ad.additional_info ?? "")) return true;
      if (clinicalNotes !== (ad.clinical_notes ?? "")) return true;

      // Check people arrays
      const peopleArrays = [
        { current: decisionMakers, original: ad.decision_makers },
        { current: influencers, original: ad.influencers },
        { current: orderEntryTeam, original: ad.order_entry_team },
        { current: schedulingTeam, original: ad.scheduling_team },
        { current: patientIntakeTeam, original: ad.patient_intake_team },
        { current: rcmTeam, original: ad.rcm_team },
      ];

      for (const { current, original } of peopleArrays) {
        if (current.length !== (original || []).length) return true;
        for (let i = 0; i < current.length; i++) {
          const curr = current[i];
          const orig = (original || [])[i];
          if (!orig) return true;
          if (curr.title !== (orig.title || "")) return true;
          if (curr.name !== (orig.name || "")) return true;
          if (curr.email !== (orig.email || "")) return true;
          if (curr.phone !== (orig.phone || "")) return true;
        }
      }
    }

    // Check locations
    if (locations.length !== (typedData.locations || []).length) return true;
    for (let i = 0; i < locations.length; i++) {
      const curr = locations[i];
      const orig = typedData.locations?.[i];
      if (!orig) return true;
      if (curr.name !== orig.name) return true;
      if (curr.location_id !== orig.location_id) return true;
      if (curr.address_line1 !== (orig.address_line1 ?? "")) return true;
      if (curr.address_line2 !== orig.address_line2) return true;
      if (curr.city !== (orig.city ?? "")) return true;
      if (curr.state !== (orig.state ?? "")) return true;
      if (curr.zip_code !== (orig.zip_code ?? "")) return true;
      if (curr.weekday_hours !== (orig.weekday_hours ?? "")) return true;
      if (curr.weekend_hours !== (orig.weekend_hours ?? "")) return true;
      if (curr.parking_directions !== (orig.parking_directions ?? "")) return true;
      if (curr.is_active !== !!orig.is_active) return true;
    }

    // Check specialties
    if (specialties.length !== (typedData.speciality_services || []).length) return true;
    for (let i = 0; i < specialties.length; i++) {
      const curr = specialties[i];
      const orig = typedData.speciality_services?.[i];
      if (!orig) return true;
      if (curr.specialty_name !== (orig.specialty_name ?? "")) return true;
      if (JSON.stringify(curr.location_ids.sort()) !== JSON.stringify((orig.location_ids || []).sort())) return true;
      if (curr.physician_names_source_type !== (orig.physician_names_source_type ?? null)) return true;
      if (curr.physician_names_source_name !== (orig.physician_names_source_name ?? null)) return true;
      if (curr.new_patients_source_type !== (orig.new_patients_source_type ?? null)) return true;
      if (curr.new_patients_source_name !== (orig.new_patients_source_name ?? null)) return true;
      if (curr.physician_locations_source_type !== (orig.physician_locations_source_type ?? null)) return true;
      if (curr.physician_locations_source_name !== (orig.physician_locations_source_name ?? null)) return true;
      if (curr.physician_credentials_source_type !== (orig.physician_credentials_source_type ?? null)) return true;
      if (curr.physician_credentials_source_name !== (orig.physician_credentials_source_name ?? null)) return true;
      if (curr.services_offered_source_type !== (orig.services_offered_source_type ?? null)) return true;
      if (curr.services_offered_source_name !== (orig.services_offered_source_name ?? null)) return true;
      if (curr.patient_prep_source_type !== (orig.patient_prep_source_type ?? null)) return true;
      if (curr.patient_prep_source_name !== (orig.patient_prep_source_name ?? null)) return true;
      if (curr.patient_faqs_source_type !== (orig.patient_faqs_source_type ?? null)) return true;
      if (curr.patient_faqs_source_name !== (orig.patient_faqs_source_name ?? null)) return true;
      if (curr.is_active !== !!orig.is_active) return true;

      // Check services array
      if (curr.services.length !== (orig.services || []).length) return true;
      for (let j = 0; j < curr.services.length; j++) {
        const currSvc = curr.services[j];
        const origSvc = orig.services?.[j];
        if (!origSvc) return true;
        if (currSvc.name !== (origSvc.name ?? "")) return true;
        if (currSvc.patient_prep_requirements !== (origSvc.patient_prep_requirements ?? "")) return true;
        if (currSvc.faq !== (origSvc.faq ?? "")) return true;
        if (currSvc.service_information_name !== (origSvc.service_information_name ?? null)) return true;
        if (currSvc.service_information_source !== (origSvc.service_information_source ?? null)) return true;
      }
    }

    // Check insurance
    if (typedData.insurance) {
      if (insurance.accepted_payers_source !== (typedData.insurance.accepted_payers_source ?? "")) return true;
      if (insurance.accepted_payers_source_details !== (typedData.insurance.accepted_payers_source_details ?? "")) return true;
      if (insurance.insurance_verification_source !== (typedData.insurance.insurance_verification_source ?? "")) return true;
      if (insurance.insurance_verification_source_details !== (typedData.insurance.insurance_verification_source_details ?? "")) return true;
      if (insurance.patient_copay_source !== (typedData.insurance.patient_copay_source ?? "")) return true;
      if (insurance.patient_copay_source_details !== (typedData.insurance.patient_copay_source_details ?? "")) return true;
      if (insurance.is_active !== !!typedData.insurance.is_active) return true;
    }

    return false;
  }, [
    typedData,
    accountName,
    websiteAddress,
    headquartersAddress,
    schedulingStructure,
    rcmStructure,
    orderEntryTeamSize,
    schedulingTeamSize,
    patientIntakeTeamSize,
    rcmTeamSize,
    opportunitySizing,
    emrSystems,
    telephonySystems,
    schedulingPhoneNumbers,
    insuranceVerificationSystem,
    insuranceVerificationDetails,
    additionalInfo,
    clinicalNotes,
    decisionMakers,
    influencers,
    orderEntryTeam,
    schedulingTeam,
    patientIntakeTeam,
    rcmTeam,
    locations,
    specialties,
    insurance,
  ]);

  // Function to get which tabs have unsaved changes
  const getUnsavedChangesTabs = useCallback(() => {
    if (!typedData) return [];

    const tabsWithChanges = [];
    const ad = typedData.account_details;

    // Check account tab
    let accountHasChanges = false;
    if (ad) {
      if (accountName !== (ad.account_name ?? "")) accountHasChanges = true;
      if (websiteAddress !== (ad.website_address ?? "")) accountHasChanges = true;
      if (headquartersAddress !== (ad.headquarters_address ?? "")) accountHasChanges = true;
      if (schedulingStructure !== (ad.scheduling_structure ?? "")) accountHasChanges = true;
      if (rcmStructure !== (ad.rcm_structure ?? "")) accountHasChanges = true;
      if (orderEntryTeamSize !== (ad.order_entry_team_size ?? undefined)) accountHasChanges = true;
      if (schedulingTeamSize !== (ad.scheduling_team_size ?? undefined)) accountHasChanges = true;
      if (patientIntakeTeamSize !== (ad.patient_intake_team_size ?? undefined)) accountHasChanges = true;
      if (rcmTeamSize !== (ad.rcm_team_size ?? undefined)) accountHasChanges = true;

      // Check opportunity sizing
      const currentOpp = {
        monthly_orders_count: opportunitySizing.monthly_orders_count,
        monthly_patients_scheduled: opportunitySizing.monthly_patients_scheduled,
        monthly_patients_checked_in: opportunitySizing.monthly_patients_checked_in,
      };
      const originalOpp = {
        monthly_orders_count: ad.monthly_orders_count,
        monthly_patients_scheduled: ad.monthly_patients_scheduled,
        monthly_patients_checked_in: ad.monthly_patients_checked_in,
      };
      if (JSON.stringify(currentOpp) !== JSON.stringify(originalOpp)) accountHasChanges = true;

      // Check arrays
      if (JSON.stringify(emrSystems) !== JSON.stringify(ad.emr_ris_systems || [])) accountHasChanges = true;
      if (JSON.stringify(telephonySystems) !== JSON.stringify(ad.telephony_ccas_systems || [])) accountHasChanges = true;
      if (JSON.stringify(schedulingPhoneNumbers) !== JSON.stringify(ad.scheduling_phone_numbers || [])) accountHasChanges = true;
      if (insuranceVerificationSystem !== (ad.insurance_verification_system ?? "")) accountHasChanges = true;
      if (insuranceVerificationDetails !== (ad.insurance_verification_details ?? "")) accountHasChanges = true;
      if (additionalInfo !== (ad.additional_info ?? "")) accountHasChanges = true;
      if (clinicalNotes !== (ad.clinical_notes ?? "")) accountHasChanges = true;

      // Check people arrays
      const peopleArrays = [
        { current: decisionMakers, original: ad.decision_makers },
        { current: influencers, original: ad.influencers },
        { current: orderEntryTeam, original: ad.order_entry_team },
        { current: schedulingTeam, original: ad.scheduling_team },
        { current: patientIntakeTeam, original: ad.patient_intake_team },
        { current: rcmTeam, original: ad.rcm_team },
      ];

      for (const { current, original } of peopleArrays) {
        if (current.length !== (original || []).length) {
          accountHasChanges = true;
          break;
        }
        for (let i = 0; i < current.length; i++) {
          const curr = current[i];
          const orig = (original || [])[i];
          if (!orig) {
            accountHasChanges = true;
            break;
          }
          if (curr.title !== (orig.title || "")) accountHasChanges = true;
          if (curr.name !== (orig.name || "")) accountHasChanges = true;
          if (curr.email !== (orig.email || "")) accountHasChanges = true;
          if (curr.phone !== (orig.phone || "")) accountHasChanges = true;
          if (accountHasChanges) break;
        }
        if (accountHasChanges) break;
      }
    }
    if (accountHasChanges) tabsWithChanges.push("Account");

    // Check locations tab
    let locationsHasChanges = false;
    if (locations.length !== (typedData.locations || []).length) locationsHasChanges = true;
    else {
      for (let i = 0; i < locations.length; i++) {
        const curr = locations[i];
        const orig = typedData.locations?.[i];
        if (!orig) {
          locationsHasChanges = true;
          break;
        }
        if (curr.name !== orig.name) locationsHasChanges = true;
        if (curr.location_id !== orig.location_id) locationsHasChanges = true;
        if (curr.address_line1 !== (orig.address_line1 ?? "")) locationsHasChanges = true;
        if (curr.address_line2 !== orig.address_line2) locationsHasChanges = true;
        if (curr.city !== (orig.city ?? "")) locationsHasChanges = true;
        if (curr.state !== (orig.state ?? "")) locationsHasChanges = true;
        if (curr.zip_code !== (orig.zip_code ?? "")) locationsHasChanges = true;
        if (curr.weekday_hours !== (orig.weekday_hours ?? "")) locationsHasChanges = true;
        if (curr.weekend_hours !== (orig.weekend_hours ?? "")) locationsHasChanges = true;
        if (curr.parking_directions !== (orig.parking_directions ?? "")) locationsHasChanges = true;
        if (curr.is_active !== !!orig.is_active) locationsHasChanges = true;
        if (locationsHasChanges) break;
      }
    }
    if (locationsHasChanges) tabsWithChanges.push("Locations");

    // Check specialties tab
    let specialtiesHasChanges = false;
    if (specialties.length !== (typedData.speciality_services || []).length) specialtiesHasChanges = true;
    else {
      for (let i = 0; i < specialties.length; i++) {
        const curr = specialties[i];
        const orig = typedData.speciality_services?.[i];
        if (!orig) {
          specialtiesHasChanges = true;
          break;
        }
        if (curr.specialty_name !== (orig.specialty_name ?? "")) specialtiesHasChanges = true;
        if (JSON.stringify(curr.location_ids.sort()) !== JSON.stringify((orig.location_ids || []).sort())) specialtiesHasChanges = true;
        if (curr.physician_names_source_type !== (orig.physician_names_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.physician_names_source_name !== (orig.physician_names_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.new_patients_source_type !== (orig.new_patients_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.new_patients_source_name !== (orig.new_patients_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.physician_locations_source_type !== (orig.physician_locations_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.physician_locations_source_name !== (orig.physician_locations_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.physician_credentials_source_type !== (orig.physician_credentials_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.physician_credentials_source_name !== (orig.physician_credentials_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.services_offered_source_type !== (orig.services_offered_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.services_offered_source_name !== (orig.services_offered_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.patient_prep_source_type !== (orig.patient_prep_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.patient_prep_source_name !== (orig.patient_prep_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.patient_faqs_source_type !== (orig.patient_faqs_source_type ?? null)) specialtiesHasChanges = true;
        if (curr.patient_faqs_source_name !== (orig.patient_faqs_source_name ?? null)) specialtiesHasChanges = true;
        if (curr.is_active !== !!orig.is_active) specialtiesHasChanges = true;

        // Check services array
        if (curr.services.length !== (orig.services || []).length) specialtiesHasChanges = true;
        else {
          for (let j = 0; j < curr.services.length; j++) {
            const currSvc = curr.services[j];
            const origSvc = orig.services?.[j];
            if (!origSvc) {
              specialtiesHasChanges = true;
              break;
            }
            if (currSvc.name !== (origSvc.name ?? "")) specialtiesHasChanges = true;
            if (currSvc.patient_prep_requirements !== (origSvc.patient_prep_requirements ?? "")) specialtiesHasChanges = true;
            if (currSvc.faq !== (origSvc.faq ?? "")) specialtiesHasChanges = true;
            if (currSvc.service_information_name !== (origSvc.service_information_name ?? null)) specialtiesHasChanges = true;
            if (currSvc.service_information_source !== (origSvc.service_information_source ?? null)) specialtiesHasChanges = true;
            if (specialtiesHasChanges) break;
          }
        }
        if (specialtiesHasChanges) break;
      }
    }
    if (specialtiesHasChanges) tabsWithChanges.push("Specialties");

    // Check insurance tab
    let insuranceHasChanges = false;
    if (typedData.insurance) {
      if (insurance.accepted_payers_source !== (typedData.insurance.accepted_payers_source ?? "")) insuranceHasChanges = true;
      if (insurance.accepted_payers_source_details !== (typedData.insurance.accepted_payers_source_details ?? "")) insuranceHasChanges = true;
      if (insurance.insurance_verification_source !== (typedData.insurance.insurance_verification_source ?? "")) insuranceHasChanges = true;
      if (insurance.insurance_verification_source_details !== (typedData.insurance.insurance_verification_source_details ?? "")) insuranceHasChanges = true;
      if (insurance.patient_copay_source !== (typedData.insurance.patient_copay_source ?? "")) insuranceHasChanges = true;
      if (insurance.patient_copay_source_details !== (typedData.insurance.patient_copay_source_details ?? "")) insuranceHasChanges = true;
      if (insurance.is_active !== !!typedData.insurance.is_active) insuranceHasChanges = true;
    }
    if (insuranceHasChanges) tabsWithChanges.push("Insurance");

    return tabsWithChanges;
  }, [
    typedData,
    accountName,
    websiteAddress,
    headquartersAddress,
    schedulingStructure,
    rcmStructure,
    orderEntryTeamSize,
    schedulingTeamSize,
    patientIntakeTeamSize,
    rcmTeamSize,
    opportunitySizing,
    emrSystems,
    telephonySystems,
    schedulingPhoneNumbers,
    insuranceVerificationSystem,
    insuranceVerificationDetails,
    additionalInfo,
    clinicalNotes,
    decisionMakers,
    influencers,
    orderEntryTeam,
    schedulingTeam,
    patientIntakeTeam,
    rcmTeam,
    locations,
    specialties,
    insurance,
  ]);

  useEffect(() => {
    if (!orgId) return;

    const previousOrgId = previousOrgIdRef.current;
    if (previousOrgId && previousOrgId !== orgId) {
      queryClient.removeQueries({ queryKey: ['launchpad', String(previousOrgId)] });
    }

    queryClient.removeQueries({ queryKey: ['launchpad', String(orgId)] });

    if (previousOrgId !== orgId) {
      resetLaunchpadState();
      previousOrgIdRef.current = orgId;
    }
  }, [orgId, queryClient]);

  // Scroll detection effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCardMinimize = (cardId: string) => {
    setMinimizedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Original snapshot refs for diffing (step 4)
  const originalLocationsRef = useRef<Array<{ id: string; location_id: string }>>([]);
  const originalSpecialtiesRef = useRef<Array<{ id: string; location_ids: string[] }>>([]);

  // Shared selectors for locations (UI state as source of truth)
  const locationCodeMap = useMemo(() => makeLocationCodeMap(locations as any), [locations]);
  const locationOptions = useMemo(() => makeLocationOptions(locations as any), [locations]);

  // Hydrate UI state from API snapshot on load
  useEffect(() => {
    if (!typedData) {
      console.log('useEffect: No data available yet');
      return;
    }

    // Note: Using URL-based orgId now, so no need for org guard
    console.log('Hydrating UI state for orgId:', orgId, 'with data for org:', typedData.organization?.org_id);
    // Account details
    const ad = typedData.account_details;
    if (ad) {
      setAccountName(ad.account_name ?? "");
      setWebsiteAddress(ad.website_address ?? "");
      setHeadquartersAddress(ad.headquarters_address ?? "");

      const toPerson = (p: any, idx: number): Person => ({
        id: `${idx}-${p.email || p.name || Date.now()}`,
        title: p.title || "",
        name: p.name || "",
        email: p.email || "",
        phone: p.phone || "",
      });

      setDecisionMakers((ad.decision_makers || []).map(toPerson));
      setInfluencers((ad.influencers || []).map(toPerson));
      setOrderEntryTeam((ad.order_entry_team || []).map(toPerson));
      setSchedulingTeam((ad.scheduling_team || []).map(toPerson));
      setPatientIntakeTeam((ad.patient_intake_team || []).map(toPerson));
      setRcmTeam((ad.rcm_team || []).map(toPerson));

      setSchedulingStructure(ad.scheduling_structure || "");
      setRcmStructure(ad.rcm_structure || "");

      setOrderEntryTeamSize(ad.order_entry_team_size ?? undefined);
      setSchedulingTeamSize(ad.scheduling_team_size ?? undefined);
      setPatientIntakeTeamSize(ad.patient_intake_team_size ?? undefined);
      setRcmTeamSize(ad.rcm_team_size ?? undefined);

      setOpportunitySizing({
        monthly_orders_count: ad.monthly_orders_count ?? null,
        monthly_patients_scheduled: ad.monthly_patients_scheduled ?? null,
        monthly_patients_checked_in: ad.monthly_patients_checked_in ?? null,
      });

      setEmrSystems(ad.emr_ris_systems || []);
      setTelephonySystems(ad.telephony_ccas_systems || []);
      setSchedulingPhoneNumbers(ad.scheduling_phone_numbers || []);
      setInsuranceVerificationSystem(ad.insurance_verification_system || "");
      setInsuranceVerificationDetails(ad.insurance_verification_details || "");
      setAdditionalInfo(ad.additional_info || "");
      setClinicalNotes(ad.clinical_notes || "");
    }
    // Locations
    const mappedLocations: OrgLocation[] = (typedData.locations || []).map((loc) => ({
      id: loc.id,
      location_id: loc.location_id,
      name: loc.name,
      address_line1: loc.address_line1 ?? "",
      address_line2: loc.address_line2,
      city: loc.city ?? "",
      state: loc.state ?? "",
      zip_code: loc.zip_code ?? "",
      weekday_hours: loc.weekday_hours ?? "",
      weekend_hours: loc.weekend_hours ?? "",
      specialties_text: "",
      services_text: "",
      parking_directions: loc.parking_directions ?? "",
      is_active: !!loc.is_active,
    }));
    setLocations(mappedLocations);

    // Capture original locations snapshot for diffing (step 4)
    originalLocationsRef.current = (typedData.locations || []).map((loc) => ({
      id: loc.id,
      location_id: loc.location_id,
    }));

    // Specialties
    const mappedSpecs: OrgSpecialityService[] = (typedData.speciality_services || []).map((sp) => ({
      id: sp.id,
      specialty_name: sp.specialty_name ?? "",
      location_names_text: "",
      location_ids: Array.from(new Set(sp.location_ids ?? [])),
      physician_names_source_type: sp.physician_names_source_type ?? null,
      physician_names_source_name: sp.physician_names_source_name ?? null,
      physician_names_source_link: undefined,
      new_patients_source_type: sp.new_patients_source_type ?? null,
      new_patients_source_name: sp.new_patients_source_name ?? null,
      new_patients_source_link: undefined,
      physician_locations_source_type: sp.physician_locations_source_type ?? null,
      physician_locations_source_name: sp.physician_locations_source_name ?? null,
      physician_locations_source_link: undefined,
      physician_credentials_source_type: sp.physician_credentials_source_type ?? null,
      physician_credentials_source_name: sp.physician_credentials_source_name ?? null,
      physician_credentials_source_link: undefined,
      services: (sp.services ?? []).map((svc) => ({
        name: svc.name ?? "",
        patient_prep_requirements: svc.patient_prep_requirements ?? "",
        faq: svc.faq ?? "",
        service_information_name: svc.service_information_name ?? null,
        service_information_source: svc.service_information_source ?? null,
      })),
      services_offered_source_type: sp.services_offered_source_type ?? null,
      services_offered_source_name: sp.services_offered_source_name ?? null,
      services_offered_source_link: undefined,
      patient_prep_source_type: sp.patient_prep_source_type ?? null,
      patient_prep_source_name: sp.patient_prep_source_name ?? null,
      patient_prep_source_link: undefined,
      patient_faqs_source_type: sp.patient_faqs_source_type ?? null,
      patient_faqs_source_name: sp.patient_faqs_source_name ?? null,
      patient_faqs_source_link: undefined,
      is_active: !!sp.is_active,
    }));
    setSpecialties(mappedSpecs);

    // Capture original specialties snapshot for diffing (step 4)
    originalSpecialtiesRef.current = (typedData.speciality_services || []).map((sp) => ({
      id: sp.id,
      location_ids: Array.from(new Set(sp.location_ids ?? [])),
    }));

    // Insurance
    if (typedData.insurance) {
      setInsurance({
        accepted_payers_source: typedData.insurance.accepted_payers_source ?? "",
        accepted_payers_source_details: typedData.insurance.accepted_payers_source_details ?? "",
        accepted_payers_source_link: undefined,
        insurance_verification_source: typedData.insurance.insurance_verification_source ?? "",
        insurance_verification_source_details: typedData.insurance.insurance_verification_source_details ?? "",
        insurance_verification_source_link: undefined,
        patient_copay_source: typedData.insurance.patient_copay_source ?? "",
        patient_copay_source_details: typedData.insurance.patient_copay_source_details ?? "",
        patient_copay_source_link: undefined,
        is_active: !!typedData.insurance.is_active,
      });
    }
  }, [typedData]);

  // Update unsaved changes state whenever form data changes
  useEffect(() => {
    const hasChanges = checkForUnsavedChanges();
    setHasUnsavedChanges(hasChanges);
  }, [checkForUnsavedChanges]);

  // Handle tab changes with unsaved changes warning
  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      setPendingTabChange(newTab);
      setUnsavedChangesDialog({ open: true });
    } else {
      setActiveTab(newTab);
    }
  };

  const addPerson = (setter: React.Dispatch<React.SetStateAction<Person[]>>) => {
    setter(prev => [
      ...prev,
      { id: Date.now().toString(), title: "", name: "", email: "", phone: "" }
    ]);
  };

  const updatePerson = (
    setter: React.Dispatch<React.SetStateAction<Person[]>>,
    id: string,
    field: keyof Person,
    value: string
  ) => {
    setter(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePerson = (
    setter: React.Dispatch<React.SetStateAction<Person[]>>,
    id: string
  ) => {
    setter(prev => prev.filter(p => p.id !== id));
  };

  // Deletion confirmation handlers
  const handleDeletePerson = (setter: React.Dispatch<React.SetStateAction<Person[]>>, id: string, personName: string) => {
    setDeleteDialog({
      open: true,
      personId: id,
      personName,
      setter
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.personId && deleteDialog.setter) {
      // Directly remove the person from the array
      deleteDialog.setter(prev => prev.filter(p => p.id !== deleteDialog.personId));
      setDeleteDialog({ open: false });
    }
  };

  // Handle unsaved changes dialog
  const handleUnsavedChangesDialogContinue = () => {
    setUnsavedChangesDialog({ open: false });
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
    }
  };

  const handleUnsavedChangesDialogCancel = (open: boolean = false) => {
    setUnsavedChangesDialog({ open });
    if (!open) {
      setPendingTabChange(null);
    }
  };

  // Real-time field validation
  const validateFieldRealTime = (fieldName: string, value: string, section: string) => {
    const result = validateField(fieldName, value, section);

    setFieldValidations(prev => ({
      ...prev,
      [fieldName]: result.isValid ? null : result.error || null
    }));
  };

  // Save handlers (Steps 5, 6 & 8)
  const handleSaveAccount = async () => {
    try {
      // Step 8: Client-side validation
      const validation = validateAccountData({
        accountName,
        decisionMakers,
        influencers,
        orderEntryTeam,
        schedulingTeam,
        patientIntakeTeam,
        rcmTeam,
        schedulingPhoneNumbers,
      });

      // Update form validation state
      setFormValidation(validation);

      if (!validation.isValid) {
        const errorCount = validation.errors.length;
        const warningCount = validation.warnings.length;
        const totalIssues = errorCount + warningCount;

        toast({
          title: "Validation Issues Found",
          description: `Please fix ${errorCount} error(s)${warningCount > 0 ? ` and review ${warningCount} warning(s)` : ''} before saving.`,
          variant: "destructive",
        });
        return;
      }

      // Clear any previous field validations
      setFieldValidations({});

      const payload = mapAccountUIToApi({
        accountName,
        websiteAddress,
        headquartersAddress,
        decisionMakers,
        influencers,
        schedulingStructure,
        rcmStructure,
        orderEntryTeam,
        schedulingTeam,
        patientIntakeTeam,
        rcmTeam,
        orderEntryTeamSize,
        schedulingTeamSize,
        patientIntakeTeamSize,
        rcmTeamSize,
        opportunitySizing: {
          monthly_orders_count: opportunitySizing.monthly_orders_count,
          monthly_patients_scheduled: opportunitySizing.monthly_patients_scheduled,
          monthly_patients_checked_in: opportunitySizing.monthly_patients_checked_in,
        },
        emrSystems,
        telephonySystems,
        schedulingPhoneNumbers,
        insuranceVerificationSystem,
        insuranceVerificationDetails,
        additionalInfo,
        clinicalNotes,
      });
      
      await updateAccountDetails.mutateAsync({ data: payload });

      // Clear validation states on success
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});
      setHasUnsavedChanges(false);

      toast({
        title: "Success",
        description: "Account details saved successfully",
      });
    } catch (error) {
      console.error('Failed to save account details:', error);
      const errorToast = handleApiError(error, { action: "save account details" });
      toast(errorToast);
    }
  };

  const handleSaveLocations = async () => {
    try {
      // Step 8: Client-side validation
      const validation = validateLocationsData(locations);

      // Update form validation state
      setFormValidation(validation);

      if (!validation.isValid) {
        const errorCount = validation.errors.length;
        const warningCount = validation.warnings.length;

        toast({
          title: "Validation Issues Found",
          description: `Please fix ${errorCount} error(s)${warningCount > 0 ? ` and review ${warningCount} warning(s)` : ''} before saving.`,
          variant: "destructive",
        });
        return;
      }

      // Clear any previous field validations
      setFieldValidations({});
      
      // Step 5: Chained locations → specialties flow
      const locationsPayload = mapLocationsUIToApi(locations);
      await updateLocations.mutateAsync({ locations: locationsPayload });
      
      // Compute location code changes
      const codeChanges = computeLocationIdChanges(originalLocationsRef.current, locations);
      
      // Check if any specialties reference removed locations
      const currentLocationCodes = new Set(locations.map(loc => loc.location_id));
      const hasRemovedLocations = specialties.some(spec => 
        spec.location_ids.some(code => !currentLocationCodes.has(code))
      );
      
      // Update specialties if there are code changes or removed location references
      if (codeChanges.size > 0 || hasRemovedLocations) {
        const updatedSpecialties = applyLocationCodeRenamesToSpecialties(specialties, codeChanges);
        // Filter out removed location codes
        const cleanedSpecialties = updatedSpecialties.map(spec => ({
          ...spec,
          location_ids: spec.location_ids.filter(code => currentLocationCodes.has(code))
        }));
        
        const specialtiesPayload = mapSpecialtiesUIToApi(cleanedSpecialties);
        await updateSpecialties.mutateAsync({ speciality_services: specialtiesPayload });
        
        // Update local specialties state to reflect the cleaned location_ids
        setSpecialties(cleanedSpecialties);
      }
      
      // Step 9: Manual cache invalidation after chained operations complete
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: ['launchpad', String(orgId)] });
      }
      
      // Clear validation states on success
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});
      setHasUnsavedChanges(false);

      toast({
        title: "Success",
        description: "Locations saved successfully" + (codeChanges.size > 0 || hasRemovedLocations ? " (specialties updated automatically)" : ""),
      });
    } catch (error) {
      console.error('Failed to save locations:', error);
      const errorToast = handleApiError(error, { action: "save locations" });
      toast(errorToast);
    }
  };

  const handleSaveSpecialties = async () => {
    try {
      console.log('handleSaveSpecialties: Starting save process');
      console.log('handleSaveSpecialties: Current specialties state:', specialties);

      // Step 8: Client-side validation
      const availableLocationCodes = locations.map(loc => loc.location_id);
      const validation = validateSpecialtiesData(specialties, availableLocationCodes);

      // Update form validation state
      setFormValidation(validation);

      if (!validation.isValid) {
        const errorCount = validation.errors.length;
        const warningCount = validation.warnings.length;

        toast({
          title: "Validation Issues Found",
          description: `Please fix ${errorCount} error(s)${warningCount > 0 ? ` and review ${warningCount} warning(s)` : ''} before saving.`,
          variant: "destructive",
        });
        return;
      }

      // Clear any previous field validations
      setFieldValidations({});

      const payload = mapSpecialtiesUIToApi(specialties);
      console.log('handleSaveSpecialties: Mapped payload for API:', payload);

      await updateSpecialties.mutateAsync({ speciality_services: payload });

      // Clear validation states on success
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});
      setHasUnsavedChanges(false);

      toast({
        title: "Success",
        description: "Specialties saved successfully",
      });
    } catch (error) {
      console.error('handleSaveSpecialties: Failed to save specialties:', error);
      console.error('handleSaveSpecialties: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        response: error instanceof Error && 'response' in error ? (error as any).response : undefined
      });
      
      // Enhanced error handling with RBAC support
      const errorToast = handleApiError(error, { action: "save specialties" });
      toast(errorToast);
    }
  };

  const handleSaveInsurance = async () => {
    try {
      // Step 8: Client-side validation
      const validation = validateInsuranceData(insurance);

      // Update form validation state
      setFormValidation(validation);

      if (!validation.isValid) {
        const errorCount = validation.errors.length;
        const warningCount = validation.warnings.length;

        toast({
          title: "Validation Issues Found",
          description: `Please fix ${errorCount} error(s)${warningCount > 0 ? ` and review ${warningCount} warning(s)` : ''} before saving.`,
          variant: "destructive",
        });
        return;
      }

      // Clear any previous field validations
      setFieldValidations({});

      const payload = mapInsuranceUIToApi(insurance);
      await updateInsurance.mutateAsync({ insurance: payload });

      // Clear validation states on success
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});
      setHasUnsavedChanges(false);

      toast({
        title: "Success",
        description: "Insurance settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save insurance:', error);
      const errorToast = handleApiError(error, { action: "save insurance settings" });
      toast(errorToast);
    }
  };

  return (
    <div key={orgId} className="container mx-auto p-4 sm:p-4 space-y-4">
      {isLoading && (
        <div className="space-y-3">
          <div className="h-6 w-40 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted animate-pulse rounded" />
            <div className="h-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      )}
      {isError && (
        <div className="text-sm text-red-600 flex items-center gap-2">
          Failed to load data.
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch().catch((error) => {
                console.error('Launchpad refetch failed:', error);
                if (orgId) {
                  queryClient.invalidateQueries({ queryKey: ['launchpad', String(orgId)] });
                }
              });
            }}
          >
            Retry
          </Button>
        </div>
      )}
      {/* Organization data loaded successfully */}

      {(formValidation.hasErrors || formValidation.hasWarnings) && (
        <FormValidationSummary
          errors={formValidation.errors}
          warnings={formValidation.warnings}
          showSectionBreakdown={true}
        />
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="w-full flex gap-0 rounded-3xl outline outline-offset-[-1px] bg-muted p-1 overflow-hidden">
          <TabsTrigger
            value="account"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl transition-all duration-300 font-medium hover:bg-white/60 hover:text-[#1C275E] data-[state=active]:bg-[#1C275E] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="locations"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl transition-all duration-300 font-medium hover:bg-white/60 hover:text-[#1C275E] data-[state=active]:bg-[#1C275E] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Locations
          </TabsTrigger>
          <TabsTrigger
            value="specialties"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl transition-all duration-300 font-medium hover:bg-white/60 hover:text-[#1C275E] data-[state=active]:bg-[#1C275E] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Specialties
          </TabsTrigger>
          <TabsTrigger
            value="insurance"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl transition-all duration-300 font-medium hover:bg-white/60 hover:text-[#1C275E] data-[state=active]:bg-[#1C275E] data-[state=active]:text-white data-[state=active]:shadow-none"
          >
            Insurance
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex-1 first:rounded-l-3xl last:rounded-r-3xl transition-all duration-300 font-medium hover:bg-white/60 hover:text-[#1C275E] data-[state=active]:bg-[#1C275E] data-[state=active]:text-white data-[state=active]:shadow-none">
            Knowledge
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          {/* Account Details Sticky Header */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md">
            <CardHeader
              className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
                isScrolled ? 'p-1.5 shadow-lg shadow-black/10' : 'p-2 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Account Details</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const documentsSection = document.getElementById('account-documents');
                      if (documentsSection) {
                        documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2 h-8 px-3 text-sm"
                  >
                    Docs
                  </Button>
                  {canWriteLaunchpad && (
                    <Button
                      onClick={handleSaveAccount}
                      disabled={updateAccountDetails.isPending}
                      className="min-w-[80px] bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] focus:ring-2 focus:ring-[#1c275e] focus:ring-offset-2 h-8 px-3 text-sm"
                    >
                      {updateAccountDetails.isPending ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Overview */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('account-overview')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Overview</CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardMinimize('account-overview');
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['account-overview'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards['account-overview'] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                {!minimizedCards['account-overview'] && (
                  <CardContent className="px-5 py-4">
                    <AccountOverviewCard
                      accountName={accountName}
                      websiteAddress={websiteAddress}
                      headquartersAddress={headquartersAddress}
                      onChange={(field, value) => {
                        if (field === "accountName") {
                          setAccountName(value);
                          validateFieldRealTime('accountName', value, 'overview');
                        }
                        if (field === "websiteAddress") setWebsiteAddress(value);
                        if (field === "headquartersAddress") setHeadquartersAddress(value);
                      }}
                      fieldErrors={fieldValidations}
                      errors={formatValidationErrors(formValidation.errors)}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Decision Makers */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('decision-makers')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Decision Makers</CardTitle>
                      <span className="bg-[#F48024]/20 px-2 py-1 rounded-full text-xs">
                        {decisionMakers.length} added
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCardMinimize('decision-makers');
                              }}
                              className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['decision-makers'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{minimizedCards['decision-makers'] ? 'Expand' : 'Minimize'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                {!minimizedCards['decision-makers'] && (
                  <CardContent className="px-5 py-4">
                    <DecisionMakersCard
                      decisionMakers={decisionMakers}
                      onAdd={() => addPerson(setDecisionMakers)}
                      onUpdate={(id, field, value) => updatePerson(setDecisionMakers, id, field, value)}
                      onRemove={(id, personName) => handleDeletePerson(setDecisionMakers, id, personName)}
                      errors={formatValidationErrors(formValidation.errors)}
                      formErrors={formValidation.errors}
                      formWarnings={formValidation.warnings}
                      onValidateField={validateFieldRealTime}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Influencers */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('influencers')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Influencers</CardTitle>
                      <span className="bg-[#F48024]/20 px-2 py-1 rounded-full text-xs">
                        {influencers.length} added
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCardMinimize('influencers');
                              }}
                              className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['influencers'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{minimizedCards['influencers'] ? 'Expand' : 'Minimize'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                {!minimizedCards['influencers'] && (
                  <CardContent className="px-5 py-4">
                    <InfluencersCard
                      influencers={influencers}
                      onAdd={() => addPerson(setInfluencers)}
                      onUpdate={(id, field, value) => updatePerson(setInfluencers, id, field, value)}
                      onRemove={(id, personName) => handleDeletePerson(setInfluencers, id, personName)}
                      errors={formatValidationErrors(formValidation.errors)}
                      formErrors={formValidation.errors}
                      formWarnings={formValidation.warnings}
                      onValidateField={validateFieldRealTime}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Organization Structure */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('org-structure')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Organization Structure</CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardMinimize('org-structure');
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['org-structure'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards['org-structure'] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                {!minimizedCards['org-structure'] && (
                  <CardContent className="px-5 py-4">
                    <OrgStructureCard
                      schedulingStructure={schedulingStructure}
                      rcmStructure={rcmStructure}
                      onChange={(field, value) => {
                        if (field === "schedulingStructure") setSchedulingStructure(value);
                        if (field === "rcmStructure") setRcmStructure(value);
                      }}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Team Reporting */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('team-reporting')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Team Reporting Structure</CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardMinimize('team-reporting');
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['team-reporting'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards['team-reporting'] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                {!minimizedCards['team-reporting'] && (
                  <CardContent className="px-5 py-4 space-y-4">
                  <SectionErrorSummary
                    errors={formValidation.errors}
                    warnings={formValidation.warnings}
                    sectionName="team-reporting"
                  />
                  <TeamReportingSection
                    title="Order Entry Team Reporting"
                    team={orderEntryTeam}
                    onAdd={() => addPerson(setOrderEntryTeam)}
                    onUpdate={(id, field, value) => updatePerson(setOrderEntryTeam, id, field, value)}
                    onRemove={(id, personName) => handleDeletePerson(setOrderEntryTeam, id, personName)}
                    formErrors={formValidation.errors}
                    formWarnings={formValidation.warnings}
                    errors={formatValidationErrors(formValidation.errors)}
                    onValidateField={validateFieldRealTime}
                  />
                  <TeamReportingSection
                    title="Scheduling Team Reporting"
                    team={schedulingTeam}
                    onAdd={() => addPerson(setSchedulingTeam)}
                    onUpdate={(id, field, value) => updatePerson(setSchedulingTeam, id, field, value)}
                    onRemove={(id, personName) => handleDeletePerson(setSchedulingTeam, id, personName)}
                    formErrors={formValidation.errors}
                    formWarnings={formValidation.warnings}
                    errors={formatValidationErrors(formValidation.errors)}
                    onValidateField={validateFieldRealTime}
                  />
                  <TeamReportingSection
                    title="Patient Intake Team Reporting"
                    team={patientIntakeTeam}
                    onAdd={() => addPerson(setPatientIntakeTeam)}
                    onUpdate={(id, field, value) => updatePerson(setPatientIntakeTeam, id, field, value)}
                    onRemove={(id, personName) => handleDeletePerson(setPatientIntakeTeam, id, personName)}
                    formErrors={formValidation.errors}
                    formWarnings={formValidation.warnings}
                    errors={formatValidationErrors(formValidation.errors)}
                    onValidateField={validateFieldRealTime}
                  />
                  <TeamReportingSection
                    title="RCM Team Reporting"
                    team={rcmTeam}
                    onAdd={() => addPerson(setRcmTeam)}
                    onUpdate={(id, field, value) => updatePerson(setRcmTeam, id, field, value)}
                    onRemove={(id, personName) => handleDeletePerson(setRcmTeam, id, personName)}
                    formErrors={formValidation.errors}
                    formWarnings={formValidation.warnings}
                    errors={formatValidationErrors(formValidation.errors)}
                    onValidateField={validateFieldRealTime}
                  />
                  </CardContent>
                )}
              </Card>

              {/* Team Sizes */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('team-sizes')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Team Sizes</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCardMinimize('team-sizes');
                              }}
                              className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['team-sizes'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{minimizedCards['team-sizes'] ? 'Expand' : 'Minimize'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                {!minimizedCards['team-sizes'] && (
                  <CardContent className="px-5 py-4">
                  <TeamSizesCard
                    orderEntryTeamSize={orderEntryTeamSize}
                    schedulingTeamSize={schedulingTeamSize}
                    patientIntakeTeamSize={patientIntakeTeamSize}
                    rcmTeamSize={rcmTeamSize}
                    onChange={(field, value) => {
                      if (field === "orderEntryTeamSize") setOrderEntryTeamSize(value);
                      if (field === "schedulingTeamSize") setSchedulingTeamSize(value);
                      if (field === "patientIntakeTeamSize") setPatientIntakeTeamSize(value);
                      if (field === "rcmTeamSize") setRcmTeamSize(value);
                    }}
                  />
                  </CardContent>
                )}
              </Card>

              {/* Opportunity Sizing */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('opportunity-sizing')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Opportunity Sizing</CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardMinimize('opportunity-sizing');
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['opportunity-sizing'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards['opportunity-sizing'] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                {!minimizedCards['opportunity-sizing'] && (
                  <CardContent className="px-5 py-4">
                  <OpportunitySizingCard
                    opportunitySizing={opportunitySizing}
                    onChange={(updates) => setOpportunitySizing(prev => ({ ...prev, ...updates }))}
                  />
                  </CardContent>
                )}
              </Card>

              {/* Systems Integration */}
              <Card className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]">
                <CardHeader
                  onClick={() => toggleCardMinimize('systems-integration')}
                  className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                        <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight">Systems Integration</CardTitle>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardMinimize('systems-integration');
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards['systems-integration'] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards['systems-integration'] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                {!minimizedCards['systems-integration'] && (
                  <CardContent className="px-5 py-4">
                  <SystemsIntegrationCard
                    emrSystems={emrSystems}
                    telephonySystems={telephonySystems}
                    schedulingPhoneNumbers={schedulingPhoneNumbers}
                    insuranceVerificationSystem={insuranceVerificationSystem}
                    insuranceVerificationDetails={insuranceVerificationDetails}
                    additionalInfo={additionalInfo}
                    clinicalNotes={clinicalNotes}
                    onAddEmrSystem={() => setEmrSystems(prev => [...prev, ""])}
                    onUpdateEmrSystem={(index, value) => setEmrSystems(prev => prev.map((s, i) => (i === index ? value : s)))}
                    onRemoveEmrSystem={(index) => setEmrSystems(prev => prev.filter((_, i) => i !== index))}
                    onAddTelephonySystem={() => setTelephonySystems(prev => [...prev, ""])}
                    onUpdateTelephonySystem={(index, value) => setTelephonySystems(prev => prev.map((s, i) => (i === index ? value : s)))}
                    onRemoveTelephonySystem={(index) => setTelephonySystems(prev => prev.filter((_, i) => i !== index))}
                    onAddSchedulingPhone={() => setSchedulingPhoneNumbers(prev => [...prev, ""])}
                    onUpdateSchedulingPhone={(index, value) => setSchedulingPhoneNumbers(prev => prev.map((s, i) => (i === index ? value : s)))}
                    onRemoveSchedulingPhone={(index) => setSchedulingPhoneNumbers(prev => prev.filter((_, i) => i !== index))}
                    onChangeField={(field, value) => {
                      if (field === "insuranceVerificationSystem") setInsuranceVerificationSystem(value);
                      if (field === "insuranceVerificationDetails") setInsuranceVerificationDetails(value);
                      if (field === "additionalInfo") setAdditionalInfo(value);
                      if (field === "clinicalNotes") setClinicalNotes(value);
                    }}
                    errors={formatValidationErrors(formValidation.errors)}
                    formErrors={formValidation.errors}
                    formWarnings={formValidation.warnings}
                    onValidateField={validateFieldRealTime}
                  />
                  </CardContent>
                )}
              </Card>

              {/* Account Documents */}
              <div id="account-documents">
                <DocumentUpload
                  title={getDocumentTitle('account')}
                  documents={getDocumentsForTab(typedData, 'account')}
                  onUpload={uploadAccountDocument.mutateAsync}
                  onDelete={deleteAccountDocument.mutateAsync}
                  isUploading={uploadAccountDocument.isPending}
                  isDeleting={deleteAccountDocument.isPending}
                  readOnly={!canWriteLaunchpad}
                />
              </div>

              {/* Scroll to Top Button */}
              <ScrollToTopButton />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <LocationsModule
            locations={locations}
            onAdd={() => setLocations(prev => [...prev, {
              id: Date.now().toString(),
              location_id: "",
              name: "",
              address_line1: "",
              address_line2: null,
              city: "",
              state: "",
              zip_code: "",
              weekday_hours: "",
              weekend_hours: "",
              specialties_text: "",
              services_text: "",
              parking_directions: "",
              is_active: true,
            }])}
            onUpdate={(id, updates) => setLocations(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))}
            onRemove={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
            onSave={handleSaveLocations}
            isSaving={updateLocations.isPending || updateSpecialties.isPending}
          />


          {/* Locations Documents */}
          <div id="locations-documents">
            <DocumentUpload
              title={getDocumentTitle('locations')}
              documents={getDocumentsForTab(typedData, 'locations')}
              onUpload={uploadLocationsDocument.mutateAsync}
              onDelete={deleteLocationsDocument.mutateAsync}
              isUploading={uploadLocationsDocument.isPending}
              isDeleting={deleteLocationsDocument.isPending}
              readOnly={!canWriteLaunchpad}
            />
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>

        <TabsContent value="specialties">
          <SpecialtiesModule
            specialties={specialties}
            locations={locations}
            locationOptions={locationOptions}
            unresolvedNotice={(id, codes) => {
              console.warn('Unresolved location codes for specialty', id, codes);
            }}
            onSwitchTab={setActiveTab}
            onAdd={() => setSpecialties(prev => [...prev, {
              id: Date.now().toString(),
              specialty_name: "",
              location_names_text: "",
              location_ids: [],
              physician_names_source_type: undefined,
              physician_names_source_name: undefined,
              physician_names_source_link: undefined,
              new_patients_source_type: undefined,
              new_patients_source_name: undefined,
              new_patients_source_link: undefined,
              physician_locations_source_type: undefined,
              physician_locations_source_name: undefined,
              physician_locations_source_link: undefined,
              physician_credentials_source_type: undefined,
              physician_credentials_source_name: undefined,
              physician_credentials_source_link: undefined,
              services: [],
              services_offered_source_type: undefined,
              services_offered_source_name: undefined,
              services_offered_source_link: undefined,
              patient_prep_source_type: undefined,
              patient_prep_source_name: undefined,
              patient_prep_source_link: undefined,
              patient_faqs_source_type: undefined,
              patient_faqs_source_name: undefined,
              patient_faqs_source_link: undefined,
              is_active: true,
            }])}
            onUpdate={(id, updates) => setSpecialties(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
            onRemove={(id) => setSpecialties(prev => prev.filter(s => s.id !== id))}
            onSave={handleSaveSpecialties}
            isSaving={updateSpecialties.isPending}
          />

          {/* Specialties Documents */}
          <div id="specialties-documents">
            <DocumentUpload
              title={getDocumentTitle('specialties')}
              documents={getDocumentsForTab(typedData, 'specialties')}
              onUpload={uploadSpecialtiesDocument.mutateAsync}
              onDelete={deleteSpecialtiesDocument.mutateAsync}
              isUploading={uploadSpecialtiesDocument.isPending}
              isDeleting={deleteSpecialtiesDocument.isPending}
              readOnly={!canWriteLaunchpad}
            />
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>

        <TabsContent value="insurance">
          {/* Insurance Sticky Header */}
          <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md">
            <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
              isScrolled
                ? 'p-1.5 shadow-lg shadow-black/10'
                : 'p-2 shadow-sm'
            }`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Insurance</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const documentsSection = document.getElementById('insurance-documents');
                      if (documentsSection) {
                        documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2 h-8 px-3 text-sm"
                  >
                    Docs
                  </Button>
                  {canWriteLaunchpad && (
                    <Button
                      onClick={handleSaveInsurance}
                      disabled={updateInsurance.isPending}
                      className="min-w-[80px] bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] focus:ring-2 focus:ring-[#1c275e] focus:ring-offset-2 h-8 px-3 text-sm"
                    >
                      {updateInsurance.isPending ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <InsuranceModule
                insurance={insurance}
                onChange={(updates) => setInsurance(prev => ({ ...prev, ...updates }))}
              />
            </CardContent>
          </Card>

          {/* Insurance Documents */}
          <div id="insurance-documents">
            <DocumentUpload
              title={getDocumentTitle('insurance')}
              documents={getDocumentsForTab(typedData, 'insurance')}
              onUpload={uploadInsuranceDocument.mutateAsync}
              onDelete={deleteInsuranceDocument.mutateAsync}
              isUploading={uploadInsuranceDocument.isPending}
              isDeleting={deleteInsuranceDocument.isPending}
              readOnly={!canWriteLaunchpad}
            />
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeModule
            orgId={orgId}
            curatedKb={typedData?.curated_kb}
            curatedKbCount={typedData?.metadata?.curated_kb_count}
          />

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>
      </Tabs>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.personName}?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Warning Dialog */}
      <AlertDialog open={unsavedChangesDialog.open} onOpenChange={handleUnsavedChangesDialogCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Unsaved changes in {getUnsavedChangesTabs().length === 1 ? 'tab' : 'tabs'}: <strong>{getUnsavedChangesTabs().join(", ")}</strong>. Switching tabs will keep your changes—they will not be lost. Please save before leaving launchpad page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleUnsavedChangesDialogCancel(false)}>
              Stay in Current Tab
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnsavedChangesDialogContinue}
              className="bg-[#1C275E] hover:bg-[#233072]"
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


