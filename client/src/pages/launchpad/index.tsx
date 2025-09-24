import React, { useEffect, useMemo, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormSummary } from "@/components/ui/form-error";
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
import { OrgInsurance, OrgLocation, OrgSpecialityService, AccountOpportunitySizing, SchedulingNumbersMode } from "@/components/launchpad/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useLaunchpadData,
  useUpdateAccountDetails,
  useUpdateLocations,
  useUpdateSpecialties,
  useUpdateInsurance,
  invalidateLaunchpadCache,
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
  formatValidationErrors
} from "@/lib/launchpad.utils";
import DocumentUpload from "@/components/launchpad/shared/DocumentUpload";
import { getDocumentsForTab, getDocumentTitle } from "@/lib/launchpad.utils";
import ScrollToTopButton from "@/components/ui/scroll-to-top";

type Person = {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
};

export default function Launchpad() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Temporary fallback: extract orgId from JWT token if user data is missing
  let orgId = user?.org_id ?? user?.workspaceId;
  if (!orgId) {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        orgId = payload.orgId;
        console.log('Launchpad: Extracted orgId from JWT token:', orgId);
      }
    } catch (error) {
      console.warn('Launchpad: Failed to extract orgId from token:', error);
    }
  }
  
  const { data, isLoading, isError, refetch } = useLaunchpadData(orgId, !!orgId && !authLoading);

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
  const [schedulingNumbersMode, setSchedulingNumbersMode] = useState<SchedulingNumbersMode>("Single");

  // Locations (hydrated from API snapshot)
  const [locations, setLocations] = useState<OrgLocation[]>([]);

  // Basic form error summary (placeholder for future validation)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Specialties (hydrated from API snapshot)
  const [specialties, setSpecialties] = useState<OrgSpecialityService[]>([]);

  // Insurance (hydrated from API snapshot)
  const [insurance, setInsurance] = useState<OrgInsurance>({ is_active: true });

  // Tab management
  const [activeTab, setActiveTab] = useState("account");

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = useState<Record<string, boolean>>({});

  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    personId?: string;
    personName?: string;
    setter?: React.Dispatch<React.SetStateAction<Person[]>>;
  }>({ open: false });

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
    if (!data) {
      console.log('useEffect: No data available yet');
      return;
    }
    
    
    // Org guard: ensure tenant match
    if (user?.org_id && data.organization.org_id !== user.org_id) {
      console.error('Organization mismatch between auth and launchpad data', {
        userOrgId: user.org_id,
        dataOrgId: data.organization.org_id
      });
      return;
    }
    // Account details
    const ad = data.account_details;
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
        monthly_orders_count: ad.monthly_orders_count ?? undefined,
        monthly_patients_scheduled: ad.monthly_patients_scheduled ?? undefined,
        monthly_patients_checked_in: ad.monthly_patients_checked_in ?? undefined,
      });

      setEmrSystems(ad.emr_ris_systems || []);
      setTelephonySystems(ad.telephony_ccas_systems || []);
      setSchedulingPhoneNumbers(ad.scheduling_phone_numbers || []);
      setSchedulingNumbersMode((ad.scheduling_phone_numbers || []).length > 1 ? "Multiple" : "Single");
      setInsuranceVerificationSystem(ad.insurance_verification_system || "");
      setInsuranceVerificationDetails(ad.insurance_verification_details || "");
      setAdditionalInfo(ad.additional_info || "");
      setClinicalNotes(ad.clinical_notes || "");
    }
    // Locations
    const mappedLocations: OrgLocation[] = (data.locations || []).map((loc) => ({
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
    originalLocationsRef.current = (data.locations || []).map((loc) => ({
      id: loc.id,
      location_id: loc.location_id,
    }));

    // Specialties
    const mappedSpecs: OrgSpecialityService[] = (data.speciality_services || []).map((sp) => ({
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
    originalSpecialtiesRef.current = (data.speciality_services || []).map((sp) => ({
      id: sp.id,
      location_ids: Array.from(new Set(sp.location_ids ?? [])),
    }));

    // Insurance
    if (data.insurance) {
      setInsurance({
        accepted_payers_source: data.insurance.accepted_payers_source ?? "",
        accepted_payers_source_details: data.insurance.accepted_payers_source_details ?? "",
        accepted_payers_source_link: undefined,
        insurance_verification_source: data.insurance.insurance_verification_source ?? "",
        insurance_verification_source_details: data.insurance.insurance_verification_source_details ?? "",
        insurance_verification_source_link: undefined,
        patient_copay_source: data.insurance.patient_copay_source ?? "",
        patient_copay_source_details: data.insurance.patient_copay_source_details ?? "",
        patient_copay_source_link: undefined,
        is_active: !!data.insurance.is_active,
      });
    }
  }, [data, user?.org_id]);

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
      
      if (!validation.isValid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        setFormErrors(formattedErrors);
        toast({
          title: "Validation Error",
          description: `Please fix ${validation.errors.length} validation error(s) before saving.`,
          variant: "destructive",
        });
        return;
      }
      
      // Clear any previous validation errors
      setFormErrors({});

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
      toast({
        title: "Success",
        description: "Account details saved successfully",
      });
    } catch (error) {
      console.error('Failed to save account details:', error);
      toast({
        title: "Error",
        description: "Failed to save account details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveLocations = async () => {
    try {
      // Step 8: Client-side validation
      const validation = validateLocationsData(locations);
      
      if (!validation.isValid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        setFormErrors(formattedErrors);
        toast({
          title: "Validation Error",
          description: `Please fix ${validation.errors.length} validation error(s) before saving.`,
          variant: "destructive",
        });
        return;
      }
      
      // Clear any previous validation errors
      setFormErrors({});
      
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
      invalidateLaunchpadCache(queryClient, orgId);
      
      toast({
        title: "Success",
        description: "Locations saved successfully" + (codeChanges.size > 0 || hasRemovedLocations ? " (specialties updated automatically)" : ""),
      });
    } catch (error) {
      console.error('Failed to save locations:', error);
      toast({
        title: "Error",
        description: "Failed to save locations. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSpecialties = async () => {
    try {
      console.log('handleSaveSpecialties: Starting save process');
      console.log('handleSaveSpecialties: Current specialties state:', specialties);

      // Check for duplicate specialty_name
      const specialtyNames = specialties.map(s => s.specialty_name.trim().toLowerCase());
      const duplicateNames = specialtyNames.filter((name, index) => specialtyNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        setFormErrors({ 'specialty_name': `Duplicate specialty names found: ${Array.from(new Set(duplicateNames)).join(', ')}` });
        toast({
          title: "Validation Error",
          description: "Duplicate specialty names are not allowed. Please ensure each specialty has a unique name.",
          variant: "destructive",
        });
        return;
      }

      // Step 8: Client-side validation
      const availableLocationCodes = locations.map(loc => loc.location_id);
      const validation = validateSpecialtiesData(specialties, availableLocationCodes);

      if (!validation.isValid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        setFormErrors(formattedErrors);
        toast({
          title: "Validation Error",
          description: `Please fix ${validation.errors.length} validation error(s) before saving.`,
          variant: "destructive",
        });
        return;
      }

      // Clear any previous validation errors
      setFormErrors({});

      const payload = mapSpecialtiesUIToApi(specialties);
      console.log('handleSaveSpecialties: Mapped payload for API:', payload);

      await updateSpecialties.mutateAsync({ speciality_services: payload });
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
      toast({
        title: "Error",
        description: "Failed to save specialties. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveInsurance = async () => {
    try {
      // Step 8: Client-side validation
      const validation = validateInsuranceData(insurance);
      
      if (!validation.isValid) {
        const formattedErrors = formatValidationErrors(validation.errors);
        setFormErrors(formattedErrors);
        toast({
          title: "Validation Error",
          description: `Please fix ${validation.errors.length} validation error(s) before saving.`,
          variant: "destructive",
        });
        return;
      }
      
      // Clear any previous validation errors
      setFormErrors({});
      
      const payload = mapInsuranceUIToApi(insurance);
      await updateInsurance.mutateAsync({ insurance: payload });
      toast({
        title: "Success",
        description: "Insurance settings saved successfully",
      });
    } catch (error) {
      console.error('Failed to save insurance:', error);
      toast({
        title: "Error",
        description: "Failed to save insurance settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-4 space-y-4">
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
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      )}
      {user?.org_id && data && data.organization.org_id !== user.org_id && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-3 rounded">
          Organization mismatch. For your security, data is hidden. Please reload or contact support.
        </div>
      )}

      {Object.keys(formErrors).length > 0 && (
        <FormSummary errors={formErrors} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
          <Card className="border-0 shadow-lg bg-white rounded-xl">
            <CardHeader className="sticky top-0 z-50 bg-[#1C275E] text-white p-3 border-b border-[#1C275E]/20 shadow-sm rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const documentsSection = document.getElementById('account-documents');
                      if (documentsSection) {
                        documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white"
                  >
                    View Documents
                  </Button>
                  <Button
                    onClick={handleSaveAccount}
                    disabled={updateAccountDetails.isPending}
                    className="min-w-[100px] bg-[#2f7a5d] hover:bg-[#276651] active:bg-[#1f5040] text-white focus:ring-2 focus:ring-[#22b07d] focus:ring-offset-2"
                  >
                    {updateAccountDetails.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Overview</CardTitle>
                </div>
                <div className="flex items-center gap-2">

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardMinimize('account-overview')}
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
              </div>
            </CardHeader>
            {!minimizedCards['account-overview'] && (
              <CardContent className="p-4">
              <AccountOverviewCard
                accountName={accountName}
                websiteAddress={websiteAddress}
                headquartersAddress={headquartersAddress}
                onChange={(field, value) => {
                  if (field === "accountName") setAccountName(value);
                  if (field === "websiteAddress") setWebsiteAddress(value);
                  if (field === "headquartersAddress") setHeadquartersAddress(value);
                }}
              />
              </CardContent>
            )}
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Decision Makers</CardTitle>
                  <span className="bg-[#F48024]/20 px-2 py-1 rounded-full text-xs">
                    {decisionMakers.length} added
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => addPerson(setDecisionMakers)}
                    className="min-h-[36px] bg-[#f49024] hover:bg-[#d87f1f] text-white"
                  >
                    + Add Person
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardMinimize('decision-makers')}
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
              <CardContent className="p-4">
              <DecisionMakersCard
                decisionMakers={decisionMakers}
                onUpdate={(id, field, value) => updatePerson(setDecisionMakers, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setDecisionMakers, id, personName)}
              />
              </CardContent>
            )}
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Influencers</CardTitle>
                  <span className="bg-[#F48024]/20 px-2 py-1 rounded-full text-xs">
                    {influencers.length} added
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => addPerson(setInfluencers)}
                    className="min-h-[36px] bg-[#f49024] hover:bg-[#d87f1f] text-white"
                  >
                    + Add Person
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardMinimize('influencers')}
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
              <CardContent className="p-4">
              <InfluencersCard
                influencers={influencers}
                onUpdate={(id, field, value) => updatePerson(setInfluencers, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setInfluencers, id, personName)}
              />
              </CardContent>
            )}
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <CardTitle className="text-lg font-semibold">Organization Structure</CardTitle>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                        onClick={() => toggleCardMinimize('org-structure')}
                        className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
            </CardHeader>
            {!minimizedCards['org-structure'] && (
              <CardContent className="p-4">
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

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Team Reporting Structure</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardMinimize('team-reporting')}
                        className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
              <CardContent className="p-4 space-y-4">
              <TeamReportingSection
                title="Order Entry Team Reporting"
                team={orderEntryTeam}
                onAdd={() => addPerson(setOrderEntryTeam)}
                onUpdate={(id, field, value) => updatePerson(setOrderEntryTeam, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setOrderEntryTeam, id, personName)}
              />
              <TeamReportingSection
                title="Scheduling Team Reporting"
                team={schedulingTeam}
                onAdd={() => addPerson(setSchedulingTeam)}
                onUpdate={(id, field, value) => updatePerson(setSchedulingTeam, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setSchedulingTeam, id, personName)}
              />
              <TeamReportingSection
                title="Patient Intake Team Reporting"
                team={patientIntakeTeam}
                onAdd={() => addPerson(setPatientIntakeTeam)}
                onUpdate={(id, field, value) => updatePerson(setPatientIntakeTeam, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setPatientIntakeTeam, id, personName)}
              />
              <TeamReportingSection
                title="RCM Team Reporting"
                team={rcmTeam}
                onAdd={() => addPerson(setRcmTeam)}
                onUpdate={(id, field, value) => updatePerson(setRcmTeam, id, field, value)}
                onRemove={(id, personName) => handleDeletePerson(setRcmTeam, id, personName)}
              />
              </CardContent>
            )}
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Team Sizes</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardMinimize('team-sizes')}
                        className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
            </CardHeader>
            {!minimizedCards['team-sizes'] && (
              <CardContent className="p-4">
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

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Opportunity Sizing</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardMinimize('opportunity-sizing')}
                        className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
              <CardContent className="p-4">
              <OpportunitySizingCard
                opportunitySizing={opportunitySizing}
                onChange={(updates) => setOpportunitySizing(prev => ({ ...prev, ...updates }))}
              />
              </CardContent>
            )}
          </Card>

          <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Systems Integration</CardTitle>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardMinimize('systems-integration')}
                        className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
              <CardContent className="p-4">
              <SystemsIntegrationCard
                emrSystems={emrSystems}
                telephonySystems={telephonySystems}
                schedulingNumbersMode={schedulingNumbersMode}
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
                onChangeSchedulingMode={setSchedulingNumbersMode}
                onAddSchedulingPhone={() => setSchedulingPhoneNumbers(prev => [...prev, ""])}
                onUpdateSchedulingPhone={(index, value) => setSchedulingPhoneNumbers(prev => prev.map((s, i) => (i === index ? value : s)))}
                onRemoveSchedulingPhone={(index) => setSchedulingPhoneNumbers(prev => prev.filter((_, i) => i !== index))}
                onChangeField={(field, value) => {
                  if (field === "insuranceVerificationSystem") setInsuranceVerificationSystem(value);
                  if (field === "insuranceVerificationDetails") setInsuranceVerificationDetails(value);
                  if (field === "additionalInfo") setAdditionalInfo(value);
                  if (field === "clinicalNotes") setClinicalNotes(value);
                }}
              />
              </CardContent>
            )}
          </Card>

          {/* Account Documents */}
          <div id="account-documents">
            <DocumentUpload
              title={getDocumentTitle('account')}
              documents={getDocumentsForTab(data, 'account')}
              onUpload={uploadAccountDocument.mutateAsync}
              onDelete={deleteAccountDocument.mutateAsync}
              isUploading={uploadAccountDocument.isPending}
              isDeleting={deleteAccountDocument.isPending}
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
              documents={getDocumentsForTab(data, 'locations')}
              onUpload={uploadLocationsDocument.mutateAsync}
              onDelete={deleteLocationsDocument.mutateAsync}
              isUploading={uploadLocationsDocument.isPending}
              isDeleting={deleteLocationsDocument.isPending}
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
              documents={getDocumentsForTab(data, 'specialties')}
              onUpload={uploadSpecialtiesDocument.mutateAsync}
              onDelete={deleteSpecialtiesDocument.mutateAsync}
              isUploading={uploadSpecialtiesDocument.isPending}
              isDeleting={deleteSpecialtiesDocument.isPending}
            />
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>

        <TabsContent value="insurance">
          {/* Insurance Sticky Header */}
          <Card className="border-0 shadow-lg bg-white rounded-xl">
            <CardHeader className="sticky top-0 z-50 bg-[#1C275E] text-white p-3 border-b border-[#1C275E]/20 shadow-sm rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-lg font-semibold">Insurance</CardTitle>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const documentsSection = document.getElementById('insurance-documents');
                      if (documentsSection) {
                        documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white"
                  >
                    View Documents
                  </Button>
                  <Button
                    onClick={handleSaveInsurance}
                    disabled={updateInsurance.isPending}
                    className="min-w-[100px] bg-[#2f7a5d] hover:bg-[#276651] active:bg-[#1f5040] text-white focus:ring-2 focus:ring-[#22b07d] focus:ring-offset-2"
                  >
                    {updateInsurance.isPending ? "Saving..." : "Save"}
                  </Button>
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
              documents={getDocumentsForTab(data, 'insurance')}
              onUpload={uploadInsuranceDocument.mutateAsync}
              onDelete={deleteInsuranceDocument.mutateAsync}
              isUploading={uploadInsuranceDocument.isPending}
              isDeleting={deleteInsuranceDocument.isPending}
            />
          </div>

          {/* Scroll to Top Button */}
          <ScrollToTopButton />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeModule
            orgId={orgId}
            curatedKb={data?.curated_kb}
            curatedKbCount={data?.metadata?.curated_kb_count}
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
    </div>
  );
}


