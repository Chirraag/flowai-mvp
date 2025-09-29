import React, { Suspense, lazy, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { schedulingAgentApi } from "@/api/schedulingAgent";
import { apiToUi, uiToApi } from "@/lib/schedulingAgent.mappers";
import type {
  SchedulingAgent,
  AppointmentSetupValues,
  PatientEligibilityValues,
  SchedulingPoliciesValues,
  ProviderPreferencesValues,
  AgentConfigValues,
} from "@/types/schedulingAgent";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const AppointmentSetupTab = lazy(() => import("@/components/scheduling-agent/AppointmentSetupTab"));
const PatientEligibilityTab = lazy(() => import("@/components/scheduling-agent/PatientEligibilityTab"));
const SchedulingPoliciesTab = lazy(() => import("@/components/scheduling-agent/SchedulingPoliciesTab"));
const ProviderPreferencesTab = lazy(() => import("@/components/scheduling-agent/ProviderPreferencesTab"));
const WorkflowsTab = lazy(() => import("@/components/scheduling-agent/WorkflowsTab"));
const AgentConfigTab = lazy(() => import("@/components/scheduling-agent/AgentConfigTab"));

export default function SchedulingAgent() {
  const { toast } = useToast();
  const { user, hasWriteAccess, isReadOnlyFor } = useAuth();
  
  // RBAC Permission checks
  const canWriteAgents = hasWriteAccess("ai-agents");
  const isReadOnly = isReadOnlyFor("ai-agents");

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<SchedulingAgent | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());

  // Refs used to call validation on Save Configuration
  const appointmentSetupRef = React.useRef<any>(null);
  const patientEligibilityRef = React.useRef<any>(null);
  const schedulingPoliciesRef = React.useRef<any>(null);
  const providerPreferencesRef = React.useRef<any>(null);
  const workflowsRef = React.useRef<any>(null);
  const agentConfigRef = React.useRef<any>(null);

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
    if (!agentData || !user?.org_id) return;

    setIsSaving(true);
    setSavingTabs(new Set());

    try {
      // Validate all tabs
      const validations = await Promise.all([
        appointmentSetupRef.current?.validate?.(),
        patientEligibilityRef.current?.validate?.(),
        schedulingPoliciesRef.current?.validate?.(),
        providerPreferencesRef.current?.validate?.(),
        workflowsRef.current?.validate?.(),
        agentConfigRef.current?.validate?.(),
      ]);

      // Check if any validation failed
      const failedValidations = validations.filter(v => v && !v.valid);
      if (failedValidations.length > 0) {
        const firstError = failedValidations[0];
        toast({
          title: "Validation Error",
          description: firstError.errors[0],
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      // Get values from all tabs
      const tabValues = {
        appointmentSetup: appointmentSetupRef.current?.getValues?.(),
        patientEligibility: patientEligibilityRef.current?.getValues?.(),
        schedulingPolicies: schedulingPoliciesRef.current?.getValues?.(),
        providerPreferences: providerPreferencesRef.current?.getValues?.(),
        agentConfig: agentConfigRef.current?.getValues?.(),
      };

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
        {
          key: 'agentConfig',
          name: 'Agent Config',
          apiFn: () => schedulingAgentApi.updateAgentConfig(String(user.org_id), uiToApi.agentConfig(tabValues.agentConfig)),
          currentValues: apiToUi.agentConfig(agentData),
          newValues: tabValues.agentConfig,
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

  // Individual save handlers for each tab
  const handleSaveAppointmentSetup = async (values: AppointmentSetupValues) => {
    if (!agentData || !user?.org_id) return;
    await schedulingAgentApi.updateAppointmentSetup(String(user.org_id), uiToApi.appointmentSetup(values));
    toast({ title: "Success", description: "Appointment setup saved successfully." });
    await refetchAgentData();
  };

  const handleSavePatientEligibility = async (values: PatientEligibilityValues) => {
    if (!agentData || !user?.org_id) return;
    await schedulingAgentApi.updatePatientEligibility(String(user.org_id), uiToApi.patientEligibility(values));
    toast({ title: "Success", description: "Patient eligibility settings saved successfully." });
    await refetchAgentData();
  };

  const handleSaveSchedulingPolicies = async (values: SchedulingPoliciesValues) => {
    if (!agentData || !user?.org_id) return;
    await schedulingAgentApi.updateSchedulingPolicies(String(user.org_id), uiToApi.schedulingPolicies(values));
    toast({ title: "Success", description: "Scheduling policies saved successfully." });
    await refetchAgentData();
  };

  const handleSaveProviderPreferences = async (values: ProviderPreferencesValues) => {
    if (!agentData || !user?.org_id) return;
    await schedulingAgentApi.updateProviderPreferences(String(user.org_id), uiToApi.providerPreferences(values));
    toast({ title: "Success", description: "Provider preferences saved successfully." });
    await refetchAgentData();
  };

  const handleSaveAgentConfig = async (values: AgentConfigValues) => {
    if (!agentData || !user?.org_id) return;
    await schedulingAgentApi.updateAgentConfig(String(user.org_id), uiToApi.agentConfig(values));
    toast({ title: "Success", description: "Agent configuration saved successfully." });
    await refetchAgentData();
  };


  // Function to refetch agent data after save
  const refetchAgentData = async () => {
    if (!user?.org_id) return;
    try {
      const data = await schedulingAgentApi.getSchedulingAgent(String(user.org_id));
      setAgentData(data);
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
  const initialValues = agentData ? {
    appointmentSetup: apiToUi.appointmentSetup(agentData),
    patientEligibility: apiToUi.patientEligibility(agentData),
    schedulingPolicies: apiToUi.schedulingPolicies(agentData),
    providerPreferences: apiToUi.providerPreferences(agentData),
    agentConfig: apiToUi.agentConfig(agentData),
  } : null;


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
          <TabsTrigger
            value="agent-config"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Agent Config
          </TabsTrigger>
        </TabsList>

        {/* Appointment Setup tab */}
        <TabsContent value="appointment-setup">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <AppointmentSetupTab
              ref={appointmentSetupRef}
              initialValues={initialValues?.appointmentSetup}
              onSave={handleSaveAppointmentSetup}
              isSaving={isSaving}
              readOnly={isReadOnly}
            />
          </Suspense>
        </TabsContent>

        {/* Patient & Eligibility tab */}
        <TabsContent value="patient-eligibility">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientEligibilityTab
              ref={patientEligibilityRef}
              initialValues={initialValues?.patientEligibility}
              onSave={handleSavePatientEligibility}
              isSaving={isSaving}
              readOnly={isReadOnly}
            />
          </Suspense>
        </TabsContent>

        {/* Scheduling Policies tab */}
        <TabsContent value="scheduling-policies">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <SchedulingPoliciesTab
              ref={schedulingPoliciesRef}
              initialValues={initialValues?.schedulingPolicies}
              onSave={handleSaveSchedulingPolicies}
              isSaving={isSaving}
              readOnly={isReadOnly}
            />
          </Suspense>
        </TabsContent>

        {/* Provider Preferences tab */}
        <TabsContent value="provider-preferences">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <ProviderPreferencesTab
              ref={providerPreferencesRef}
              initialValues={initialValues?.providerPreferences}
              onSave={handleSaveProviderPreferences}
              isSaving={isSaving}
              readOnly={isReadOnly}
            />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <WorkflowsTab ref={workflowsRef} readOnly={isReadOnly} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <AgentConfigTab
              ref={agentConfigRef}
              initialValues={initialValues?.agentConfig}
              onSave={handleSaveAgentConfig}
              isSaving={isSaving}
              readOnly={isReadOnly}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}