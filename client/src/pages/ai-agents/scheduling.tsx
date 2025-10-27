import React, { Suspense, lazy, useState, useEffect, useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigationBlocker } from "@/context/NavigationBlockerContext";
import { schedulingAgentApi } from "@/api/schedulingAgent";
import { apiToUi, uiToApi } from "@/lib/schedulingAgent.mappers";
import {
  validateAppointmentSetup,
  validatePatientEligibility,
  validateSchedulingPolicies,
  validateProviderPreferences,
} from "@/lib/scheduling-validation.utils";
import type {
  SchedulingAgent,
  AppointmentSetupValues,
  PatientEligibilityValues,
  SchedulingPoliciesValues,
  ProviderPreferencesValues,
} from "@/types/schedulingAgent";

// Import shared AI agents utilities
import {
  createInitialState,
  stateHelpers,
  validateAllTabs,
  executeBulkSave,
  createSaveTasks,
  generateSaveResultMessage,
  getSaveResultVariant,
  retryWithBackoff,
  handleApiError,
  hasUnsavedChanges,
  getUnsavedTabNames,
  hasChanges,
  type LoadingState,
  type ValidationResult as SharedValidationResult,
  type ValidationError,
  type BaseTabHandle
} from "@/lib/ai-agents";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const AppointmentSetupTab = lazy(() => import("@/components/scheduling-agent/AppointmentSetupTab"));
const PatientEligibilityTab = lazy(() => import("@/components/scheduling-agent/PatientEligibilityTab"));
const SchedulingPoliciesTab = lazy(() => import("@/components/scheduling-agent/SchedulingPoliciesTab"));
const ProviderPreferencesTab = lazy(() => import("@/components/scheduling-agent/ProviderPreferencesTab"));
const WorkflowsTab = lazy(() => import("@/components/scheduling-agent/WorkflowsTab"));

// Helper to adapt scheduling validation results to shared validation format
const adaptValidationResult = (
  schedulingResult: { isValid: boolean; errors: any[]; warnings?: any[] },
  section: string
): SharedValidationResult => {
  return {
    valid: schedulingResult.isValid,
    errors: schedulingResult.errors.map((err: any) => ({
      message: typeof err === 'string' ? err : (err.message || 'Validation error'),
      field: err.field || '',
      section,
      type: err.type || 'error' as const
    })),
    warnings: schedulingResult.warnings?.map((warn: any) => ({
      message: typeof warn === 'string' ? warn : (warn.message || 'Validation warning'),
      field: warn.field || '',
      section,
      type: warn.type || 'warning' as const
    })) || []
  };
};

export default function SchedulingAgent() {
  const { toast } = useToast();
  const { user, hasWriteAccess } = useAuth();
  const { setHasUnsavedChanges, setUnsavedTabs } = useNavigationBlocker();

  // RBAC Permission check for save button visibility
  const canWriteAgents = hasWriteAccess("ai-agents");

  // Loading and data state using shared utilities
  const [loadingState, setLoadingState] = useState<LoadingState>(createInitialState());
  const [agentData, setAgentData] = useState<SchedulingAgent | null>(null);

  // Validation state using shared types
  const [formValidation, setFormValidation] = useState<SharedValidationResult | null>(null);

  // Centralized tab states (Phase 1: Lift State to Parent)
  interface SchedulingTabStates {
    appointmentSetup: AppointmentSetupValues;
    patientEligibility: PatientEligibilityValues;
    schedulingPolicies: SchedulingPoliciesValues;
    providerPreferences: ProviderPreferencesValues;
  }
  const [tabStates, setTabStates] = useState<SchedulingTabStates | null>(null);


  // Ref for workflows tab (others no longer needed with lifted state)
  const workflowsRef = React.useRef<any>(null);


  // Fetch agent data on mount with retry
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!user?.org_id) {
        setLoadingState(prevState => stateHelpers.setLoading(prevState, false));
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

        setLoadingState(prevState => stateHelpers.resetRetryCount(stateHelpers.setLoading(prevState, false)));
      } catch (error) {
        console.error('Failed to fetch scheduling agent:', error);
        toast(handleApiError(error, {
          action: "load scheduling agent configuration",
          fallbackMessage: "Failed to load scheduling agent configuration after retries"
        }));
        setLoadingState(prevState => stateHelpers.setLoading(prevState, false));
      }
    };

    fetchAgentData();
  }, [user?.org_id, toast]);

  // Handle save all configurations using shared utilities
  const handleSaveAll = async () => {
    if (!agentData || !user?.org_id || !tabStates) return;

    setLoadingState(prevState => stateHelpers.setSaving(prevState, true));
    setLoadingState(prevState => stateHelpers.clearSavingTabs(prevState));

    try {
      // Get values from centralized tab state
      const tabValues = {
        appointmentSetup: tabStates.appointmentSetup,
        patientEligibility: tabStates.patientEligibility,
        schedulingPolicies: tabStates.schedulingPolicies,
        providerPreferences: tabStates.providerPreferences,
      };

      // Perform page-level validation using shared utilities
      const validation = validateAllTabs({
        'appointment-setup': () =>
          adaptValidationResult(validateAppointmentSetup(tabValues.appointmentSetup), 'appointment-setup'),
        'patient-eligibility': () =>
          adaptValidationResult(validatePatientEligibility(tabValues.patientEligibility), 'patient-eligibility'),
        'scheduling-policies': () =>
          adaptValidationResult(validateSchedulingPolicies(tabValues.schedulingPolicies), 'scheduling-policies'),
        'provider-preferences': () =>
          adaptValidationResult(validateProviderPreferences(tabValues.providerPreferences), 'provider-preferences'),
      });

      // If validation fails, show errors and prevent API calls
      if (!validation.valid) {
        setFormValidation(validation);
        toast({
          title: "Validation Errors Found",
          description: `Please fix ${validation.errors.length} error(s) before saving.`,
          variant: "destructive",
        });
        setLoadingState(prevState => stateHelpers.setSaving(prevState, false));
        return;
      }

      // Clear validation state on success
      setFormValidation(null);

      // Build update tasks using shared utilities
      const tabConfigs = [
        {
          key: 'appointment-setup',
          name: 'Appointment Setup',
          apiFn: () => retryWithBackoff(
            () => schedulingAgentApi.updateAppointmentSetup(String(user.org_id), uiToApi.appointmentSetup(tabValues.appointmentSetup)),
            1,
            500
          ),
          hasChanges: hasChanges(tabValues.appointmentSetup, apiToUi.appointmentSetup(agentData)),
        },
        {
          key: 'patient-eligibility',
          name: 'Patient & Eligibility',
          apiFn: () => retryWithBackoff(
            () => schedulingAgentApi.updatePatientEligibility(String(user.org_id), uiToApi.patientEligibility(tabValues.patientEligibility)),
            1,
            500
          ),
          hasChanges: hasChanges(tabValues.patientEligibility, apiToUi.patientEligibility(agentData)),
        },
        {
          key: 'scheduling-policies',
          name: 'Scheduling Policies',
          apiFn: () => retryWithBackoff(
            () => schedulingAgentApi.updateSchedulingPolicies(String(user.org_id), uiToApi.schedulingPolicies(tabValues.schedulingPolicies)),
            1,
            500
          ),
          hasChanges: hasChanges(tabValues.schedulingPolicies, apiToUi.schedulingPolicies(agentData)),
        },
        {
          key: 'provider-preferences',
          name: 'Provider Preferences',
          apiFn: () => retryWithBackoff(
            () => schedulingAgentApi.updateProviderPreferences(String(user.org_id), uiToApi.providerPreferences(tabValues.providerPreferences)),
            1,
            500
          ),
          hasChanges: hasChanges(tabValues.providerPreferences, apiToUi.providerPreferences(agentData)),
        },
      ];

      // Create save tasks using shared utilities
      const saveTasks = createSaveTasks(tabConfigs);

      if (saveTasks.length === 0) {
        toast({
          title: "No Changes",
          description: "No changes detected to save",
        });
        setLoadingState(prevState => stateHelpers.setSaving(prevState, false));
        return;
      }

      // Track which tabs are being saved
      const savingTabKeys = new Set(saveTasks.map(task => task.key));
        setLoadingState(prevState => stateHelpers.clearSavingTabs(prevState));
      savingTabKeys.forEach(key => {
        setLoadingState(prevState => stateHelpers.addSavingTab(prevState, key));
      });

      // Execute all updates using shared utilities
      const result = await executeBulkSave(saveTasks);

      // Show appropriate toast based on results
      toast({
        title: result.allSuccessful ? "Success" : "Partial Success",
        description: generateSaveResultMessage(result),
        variant: getSaveResultVariant(result),
      });

      // Refetch data to get updated state on success
      if (result.successful.length > 0) {
        try {
          const updatedData = await retryWithBackoff(
            () => schedulingAgentApi.getSchedulingAgent(String(user.org_id)),
            1,
            500
          );
          setAgentData(updatedData);
          console.log('Scheduling Agent - Clearing dirty tabs after successful save');
          setLoadingState(prevState => stateHelpers.clearDirtyTabs(prevState)); // Clear dirty flags on success
        } catch (refetchError) {
          console.error('Failed to refetch data:', refetchError);
          toast({
            title: "Partial Success",
            description: "Updates saved, but failed to refresh data. Please reload the page.",
            variant: "destructive",
          });
        }
      }

    } catch (error) {
      console.error('Save failed:', error);
      const errorToast = handleApiError(error, { action: "save scheduling agent configuration" });
      toast(errorToast);
    } finally {
      setLoadingState(prevState => stateHelpers.setSaving(prevState, false));
      setLoadingState(prevState => stateHelpers.clearSavingTabs(prevState));
    }
  };


  // Change handlers for tab states using shared utilities
  const handleAppointmentSetupChange = (newValues: AppointmentSetupValues) => {
    setTabStates(prev => {
      if (!prev) {
        console.warn('tabStates was null, this should not happen');
        return null;
      }
      return {
        ...prev,
        appointmentSetup: newValues
      };
    });
    setLoadingState(prevState => stateHelpers.addDirtyTab(prevState, 'appointment-setup'));
    console.log('Scheduling Agent - Added dirty tab: appointment-setup');
  };

  const handlePatientEligibilityChange = (newValues: PatientEligibilityValues) => {
    setTabStates(prev => {
      if (!prev) {
        console.warn('tabStates was null, this should not happen');
        return null;
      }
      return {
        ...prev,
        patientEligibility: newValues
      };
    });
    setLoadingState(prevState => stateHelpers.addDirtyTab(prevState, 'patient-eligibility'));
    console.log('Scheduling Agent - Added dirty tab: patient-eligibility');
  };

  const handleSchedulingPoliciesChange = (newValues: SchedulingPoliciesValues) => {
    setTabStates(prev => {
      if (!prev) {
        console.warn('tabStates was null, this should not happen');
        return null;
      }
      return {
        ...prev,
        schedulingPolicies: newValues
      };
    });
    setLoadingState(prevState => stateHelpers.addDirtyTab(prevState, 'scheduling-policies'));
    console.log('Scheduling Agent - Added dirty tab: scheduling-policies');
  };

  const handleProviderPreferencesChange = (newValues: ProviderPreferencesValues) => {
    setTabStates(prev => {
      if (!prev) {
        console.warn('tabStates was null, this should not happen');
        return null;
      }
      return {
        ...prev,
        providerPreferences: newValues
      };
    });
    setLoadingState(prevState => stateHelpers.addDirtyTab(prevState, 'provider-preferences'));
    console.log('Scheduling Agent - Added dirty tab: provider-preferences');
  };

  // Update navigation blocker when unsaved changes change
  useEffect(() => {
    const hasChanges = hasUnsavedChanges(loadingState);
    console.log('Scheduling Agent - Navigation Blocker Update:', {
      dirtyTabs: Array.from(loadingState.dirtyTabs),
      hasChanges,
      timestamp: new Date().toISOString()
    });
    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      const unsavedTabs = getUnsavedTabNames(loadingState, {
        'appointment-setup': 'Appointment Setup',
        'patient-eligibility': 'Patient & Eligibility',
        'scheduling-policies': 'Scheduling Policies',
        'provider-preferences': 'Provider Preferences',
      });
      console.log('Scheduling Agent - Setting unsaved tabs:', unsavedTabs);
      setUnsavedTabs(unsavedTabs);
    } else {
      console.log('Scheduling Agent - Clearing unsaved tabs');
      setUnsavedTabs([]);
    }
  }, [loadingState, setHasUnsavedChanges, setUnsavedTabs]);




  // Show loading state
  if (loadingState.isLoading) {
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
      {/* Header with save button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Scheduling Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Configure appointment scheduling and patient management
          </p>
        </div>
        {canWriteAgents && (
          <Button
            onClick={handleSaveAll}
            disabled={loadingState.isSaving}
            className="bg-gray-100 border border-[#1c275e] hover:bg-gray-200 text-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loadingState.isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                Save Configuration
              </>
            )}
          </Button>
        )}
      </div>

      {/* Validation Summary */}
      {formValidation && !formValidation.valid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Validation Errors</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {formValidation.errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

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
                  servicesRequiringReferrals: [],
                  insurancePlansRequiringReferrals: []
                }
              }}
              onChange={handlePatientEligibilityChange}
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
              readOnly={!canWriteAgents}
            />
          </Suspense>
        </TabsContent>

        {/* Provider Preferences tab */}
        <TabsContent value="provider-preferences">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <ProviderPreferencesTab
              values={tabStates?.providerPreferences || {
                providerBlackoutDates: [],
                establishedPatientsOnlyDays: "",
                customSchedulingRules: ""
              }}
              onChange={handleProviderPreferencesChange}
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