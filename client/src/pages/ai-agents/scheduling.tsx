import React, { Suspense, lazy, useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { schedulingAgentApi } from "@/api/schedulingAgent";
import { apiToUi, uiToApi } from "@/lib/schedulingAgent.mappers";
import {
  validateAppointmentSetup,
  validatePatientEligibility,
  validateSchedulingPolicies,
  validateProviderPreferences,
  type ValidationResult,
  type ValidationError,
} from "@/lib/scheduling-validation.utils";
import type {
  SchedulingAgent,
  AppointmentSetupValues,
  PatientEligibilityValues,
  SchedulingPoliciesValues,
  ProviderPreferencesValues,
} from "@/types/schedulingAgent";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const AppointmentSetupTab = lazy(() => import("@/components/scheduling-agent/AppointmentSetupTab"));
const PatientEligibilityTab = lazy(() => import("@/components/scheduling-agent/PatientEligibilityTab"));
const SchedulingPoliciesTab = lazy(() => import("@/components/scheduling-agent/SchedulingPoliciesTab"));
const ProviderPreferencesTab = lazy(() => import("@/components/scheduling-agent/ProviderPreferencesTab"));
const WorkflowsTab = lazy(() => import("@/components/scheduling-agent/WorkflowsTab"));

export default function SchedulingAgent() {
  const { toast } = useToast();
  const { user, hasWriteAccess } = useAuth();
  
  // RBAC Permission check for save button visibility
  const canWriteAgents = hasWriteAccess("ai-agents");

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<SchedulingAgent | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());

  // Centralized tab states (Phase 1: Lift State to Parent)
  interface SchedulingTabStates {
    appointmentSetup: AppointmentSetupValues;
    patientEligibility: PatientEligibilityValues;
    schedulingPolicies: SchedulingPoliciesValues;
    providerPreferences: ProviderPreferencesValues;
  }
  const [tabStates, setTabStates] = useState<SchedulingTabStates | null>(null);

  // Validation state
  const [formValidation, setFormValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    hasErrors: false,
    hasWarnings: false,
  });
  const [fieldValidations, setFieldValidations] = useState<Record<string, ValidationError | null>>({});

  // Ref for workflows tab (others no longer needed with lifted state)
  const workflowsRef = React.useRef<any>(null);

  // Retry utility with exponential backoff
  const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 2,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  };

  // Fetch agent data on mount with retry
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user?.org_id) {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "User organization not found",
          variant: "destructive",
        });
        return;
      }

      try {
        const data = await retryWithBackoff(
          () => schedulingAgentApi.getSchedulingAgent(String(user.org_id)),
          2,
          1000
        );
        setAgentData(data);
        
        // Initialize tab states from fetched data (Phase 1)
        setTabStates({
          appointmentSetup: apiToUi.appointmentSetup(data),
          patientEligibility: apiToUi.patientEligibility(data),
          schedulingPolicies: apiToUi.schedulingPolicies(data),
          providerPreferences: apiToUi.providerPreferences(data),
        });
        
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Failed to fetch scheduling agent:', error);
        const errorToast = handleApiError(error, { 
          action: "load scheduling agent configuration",
          fallbackMessage: "Failed to load scheduling agent configuration after retries"
        });
        toast(errorToast);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [user?.org_id, toast]);

  // Handle save all configurations with enhanced error handling
  const handleSaveAll = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    setIsSaving(true);
    setSavingTabs(new Set());

    try {
      // Get values from centralized tab state
      const tabValues = {
        appointmentSetup: tabStates.appointmentSetup,
        patientEligibility: tabStates.patientEligibility,
        schedulingPolicies: tabStates.schedulingPolicies,
        providerPreferences: tabStates.providerPreferences,
      };

      // Validate all tabs at page level
      const validations = [
        validateAppointmentSetup(tabValues.appointmentSetup),
        validatePatientEligibility(tabValues.patientEligibility),
        validateSchedulingPolicies(tabValues.schedulingPolicies),
        validateProviderPreferences(tabValues.providerPreferences),
      ];

      // Check if any validation failed
      const failedValidations = validations.filter(v => !v.isValid);
      if (failedValidations.length > 0) {
        // Aggregate all errors
        const allErrors = failedValidations.flatMap(v => v.errors);
        const allWarnings = failedValidations.flatMap(v => v.warnings);
        
        setFormValidation({
          isValid: false,
          errors: allErrors,
          warnings: allWarnings,
          hasErrors: true,
          hasWarnings: allWarnings.length > 0,
        });

        toast({
          title: "Validation Errors Found",
          description: `Please fix ${allErrors.length} error(s) before saving.`,
          variant: "destructive",
        });
        setIsSaving(false);
        return; // Prevent all API calls
      }

      // Clear validation state on success
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });

      // Build update tasks with metadata
      const updateTasks: Array<{
        promise: Promise<any>;
        name: string;
        key: string;
      }> = [];

      const tabConfigs = [
        {
          key: 'appointmentSetup',
          name: 'Appointment Setup',
          apiFn: () => schedulingAgentApi.updateAppointmentSetup(String(user.org_id), uiToApi.appointmentSetup(tabValues.appointmentSetup)),
          currentValues: apiToUi.appointmentSetup(agentData),
          newValues: tabValues.appointmentSetup,
        },
        {
          key: 'patientEligibility',
          name: 'Patient & Eligibility',
          apiFn: () => schedulingAgentApi.updatePatientEligibility(String(user.org_id), uiToApi.patientEligibility(tabValues.patientEligibility)),
          currentValues: apiToUi.patientEligibility(agentData),
          newValues: tabValues.patientEligibility,
        },
        {
          key: 'schedulingPolicies',
          name: 'Scheduling Policies',
          apiFn: () => schedulingAgentApi.updateSchedulingPolicies(String(user.org_id), uiToApi.schedulingPolicies(tabValues.schedulingPolicies)),
          currentValues: apiToUi.schedulingPolicies(agentData),
          newValues: tabValues.schedulingPolicies,
        },
        {
          key: 'providerPreferences',
          name: 'Provider Preferences',
          apiFn: () => schedulingAgentApi.updateProviderPreferences(String(user.org_id), uiToApi.providerPreferences(tabValues.providerPreferences)),
          currentValues: apiToUi.providerPreferences(agentData),
          newValues: tabValues.providerPreferences,
        },
      ];

      // Only add tasks for tabs that have changes
      for (const config of tabConfigs) {
        if (config.newValues) {
          const hasChanges = JSON.stringify(config.newValues) !== JSON.stringify(config.currentValues);
          if (hasChanges) {
            updateTasks.push({
              promise: retryWithBackoff(config.apiFn, 1, 500), // 1 retry with shorter delay for saves
              name: config.name,
              key: config.key,
            });
          }
        }
      }

      if (updateTasks.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to save",
        });
        setIsSaving(false);
        return;
      }

      // Track which tabs are being saved
      const savingTabKeys = new Set(updateTasks.map(task => task.key));
      setSavingTabs(savingTabKeys);

      // Execute all updates with individual error handling
      const results = await Promise.allSettled(updateTasks.map(task => task.promise));

      const successfulUpdates: string[] = [];
      const failedUpdates: string[] = [];

      results.forEach((result, index) => {
        const task = updateTasks[index];
        if (result.status === 'fulfilled') {
          successfulUpdates.push(task.name);
        } else {
          failedUpdates.push(task.name);
          console.error(`Failed to update ${task.name}:`, result.reason);
        }
      });

      // Show appropriate toast based on results
      if (successfulUpdates.length > 0 && failedUpdates.length === 0) {
        toast({
          title: "Success",
          description: `Updated: ${successfulUpdates.join(", ")}`,
        });

        // Refetch data to get updated state
        try {
          const updatedData = await retryWithBackoff(
            () => schedulingAgentApi.getSchedulingAgent(String(user.org_id)),
            1,
            500
          );
          setAgentData(updatedData);
          setDirtyTabs(new Set()); // Clear dirty flags on success
        } catch (refetchError) {
          console.error('Failed to refetch data:', refetchError);
          toast({
            title: "Partial Success",
            description: "Updates saved, but failed to refresh data. Please reload the page.",
            variant: "destructive",
          });
        }
      } else if (successfulUpdates.length > 0) {
        toast({
          title: "Partial Success",
          description: `Updated: ${successfulUpdates.join(", ")}. Failed: ${failedUpdates.join(", ")}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Save Failed",
          description: `Failed to update: ${failedUpdates.join(", ")}`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Save failed:', error);
      const errorToast = handleApiError(error, { action: "save scheduling agent configuration" });
      toast(errorToast);
    } finally {
      setIsSaving(false);
      setSavingTabs(new Set());
    }
  };

  // Individual save handlers for each tab with validation
  const handleSaveAppointmentSetup = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    try {
      // Validate before API call
      const validation = validateAppointmentSetup(tabStates.appointmentSetup);
      setFormValidation(validation);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0]?.message || "Please fix validation errors before saving.",
          variant: "destructive",
        });
        // Return early - validation error is already shown to the user
        return;
      }

      // Clear validation state
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});

      await schedulingAgentApi.updateAppointmentSetup(String(user.org_id), uiToApi.appointmentSetup(tabStates.appointmentSetup));
      toast({ title: "Success", description: "Appointment setup saved successfully." });
      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save appointment setup:', error);
      const errorToast = handleApiError(error, { action: "save appointment setup" });
      toast(errorToast);
    }
  };

  const handleSavePatientEligibility = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    try {
      // Validate before API call
      const validation = validatePatientEligibility(tabStates.patientEligibility);
      setFormValidation(validation);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0]?.message || "Please fix validation errors before saving.",
          variant: "destructive",
        });
        // Return early - validation error is already shown to the user
        return;
      }

      // Clear validation state
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});

      await schedulingAgentApi.updatePatientEligibility(String(user.org_id), uiToApi.patientEligibility(tabStates.patientEligibility));
      toast({ title: "Success", description: "Patient eligibility settings saved successfully." });
      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save patient eligibility:', error);
      const errorToast = handleApiError(error, { action: "save patient eligibility" });
      toast(errorToast);
    }
  };

  const handleSaveSchedulingPolicies = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    try {
      // Validate before API call
      const validation = validateSchedulingPolicies(tabStates.schedulingPolicies);
      setFormValidation(validation);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0]?.message || "Please fix validation errors before saving.",
          variant: "destructive",
        });
        // Return early - validation error is already shown to the user
        return;
      }

      // Clear validation state
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});

      await schedulingAgentApi.updateSchedulingPolicies(String(user.org_id), uiToApi.schedulingPolicies(tabStates.schedulingPolicies));
      toast({ title: "Success", description: "Scheduling policies saved successfully." });
      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save scheduling policies:', error);
      const errorToast = handleApiError(error, { action: "save scheduling policies" });
      toast(errorToast);
    }
  };

  const handleSaveProviderPreferences = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    try {
      // Validate before API call
      const validation = validateProviderPreferences(tabStates.providerPreferences);
      setFormValidation(validation);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.errors[0]?.message || "Please fix validation errors before saving.",
          variant: "destructive",
        });
        // Return early - validation error is already shown to the user
        return;
      }

      // Clear validation state
      setFormValidation({
        isValid: true,
        errors: [],
        warnings: [],
        hasErrors: false,
        hasWarnings: false,
      });
      setFieldValidations({});

      await schedulingAgentApi.updateProviderPreferences(String(user.org_id), uiToApi.providerPreferences(tabStates.providerPreferences));
      toast({ title: "Success", description: "Provider preferences saved successfully." });
      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save provider preferences:', error);
      const errorToast = handleApiError(error, { action: "save provider preferences" });
      toast(errorToast);
    }
  };

  // Change handlers for tab states (Phase 1)
  const handleAppointmentSetupChange = (newValues: AppointmentSetupValues) => {
    setTabStates(prev => prev ? {
      ...prev,
      appointmentSetup: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('appointment-setup')));
  };

  const handlePatientEligibilityChange = (newValues: PatientEligibilityValues) => {
    setTabStates(prev => prev ? {
      ...prev,
      patientEligibility: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('patient-eligibility')));
  };

  const handleSchedulingPoliciesChange = (newValues: SchedulingPoliciesValues) => {
    setTabStates(prev => prev ? {
      ...prev,
      schedulingPolicies: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('scheduling-policies')));
  };

  const handleProviderPreferencesChange = (newValues: ProviderPreferencesValues) => {
    setTabStates(prev => prev ? {
      ...prev,
      providerPreferences: newValues
    } : null);
    setDirtyTabs(prev => new Set(Array.from(prev).concat('provider-preferences')));
  };

  // Function to refetch agent data after save
  const refetchAgentData = async () => {
    if (!user?.org_id) return;
    try {
      const data = await schedulingAgentApi.getSchedulingAgent(String(user.org_id));
      setAgentData(data);
      
      // Update tab states from refetched data (Phase 1)
      setTabStates({
        appointmentSetup: apiToUi.appointmentSetup(data),
        patientEligibility: apiToUi.patientEligibility(data),
        schedulingPolicies: apiToUi.schedulingPolicies(data),
        providerPreferences: apiToUi.providerPreferences(data),
      });
    } catch (error) {
      console.error('Failed to refetch agent data:', error);
      toast({
        title: "Warning",
        description: "Settings saved, but failed to refresh data. Please reload the page.",
        variant: "destructive",
      });
    }
  };

  // Prepare initial values for tabs
  const initialValues = useMemo(() => {
    if (!agentData) return null;
    return {
      appointmentSetup: apiToUi.appointmentSetup(agentData),
      patientEligibility: apiToUi.patientEligibility(agentData),
      schedulingPolicies: apiToUi.schedulingPolicies(agentData),
      providerPreferences: apiToUi.providerPreferences(agentData),
    };
  }, [agentData]);


  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Scheduling Agent
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Loading configuration...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading scheduling agent configuration</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Tabbed layout */}
      <Tabs defaultValue="appointment-setup" className="w-full">
        {/* Improved tab navigation with brand styling */}
        <TabsList className="w-full flex gap-0 rounded-3xl outline outline-offset-[-1px] bg-muted p-1 overflow-hidden mb-6 h-12">
          <TabsTrigger
            value="appointment-setup"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Appointment Setup
          </TabsTrigger>
          <TabsTrigger
            value="patient-eligibility"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Patient & Eligibility
          </TabsTrigger>
          <TabsTrigger
            value="scheduling-policies"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Scheduling Policies
          </TabsTrigger>
          <TabsTrigger
            value="provider-preferences"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Provider Preferences
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Workflows
          </TabsTrigger>
        </TabsList>

        {/* Appointment Setup tab */}
        <TabsContent value="appointment-setup">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <AppointmentSetupTab
              values={tabStates?.appointmentSetup || {
                newPatientDuration: "",
                followUpDuration: "",
                procedureSpecific: "",
                procedureDuration: "",
                maxNewPatients: "",
                maxFollowUps: "",
                appointmentTypes: {
                  newPatient: false,
                  followUp: false,
                  procedure: false
                }
              }}
              onChange={handleAppointmentSetupChange}
              onSave={handleSaveAppointmentSetup}
              isSaving={isSaving}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Patient & Eligibility tab */}
        <TabsContent value="patient-eligibility">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientEligibilityTab
              values={tabStates?.patientEligibility || {
                patientTypes: {
                  newPatients: false,
                  existingPatients: false,
                  selfPay: false,
                  hmo: false,
                  ppo: false,
                  medicare: false,
                  medicaid: false
                },
                referralRequirements: {
                  servicesRequiringReferrals: "",
                  insurancePlansRequiringReferrals: ""
                }
              }}
              onChange={handlePatientEligibilityChange}
              onSave={handleSavePatientEligibility}
              isSaving={isSaving}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Scheduling Policies tab */}
        <TabsContent value="scheduling-policies">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <SchedulingPoliciesTab
              values={tabStates?.schedulingPolicies || {
                walkInPolicy: {
                  acceptWalkIns: false,
                  allowSameDayAppointments: false,
                  sameDayCutoffTime: ""
                },
                cancellationPolicy: {
                  minimumCancellationNotice: "",
                  noShowFee: ""
                }
              }}
              onChange={handleSchedulingPoliciesChange}
              onSave={handleSaveSchedulingPolicies}
              isSaving={isSaving}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Provider Preferences tab */}
        <TabsContent value="provider-preferences">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <ProviderPreferencesTab
              values={tabStates?.providerPreferences || {
                providerBlackoutDates: "",
                establishedPatientsOnlyDays: "",
                customSchedulingRules: ""
              }}
              onChange={handleProviderPreferencesChange}
              onSave={handleSaveProviderPreferences}
              isSaving={isSaving}
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <WorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}