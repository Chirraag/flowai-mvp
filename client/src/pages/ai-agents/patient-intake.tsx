import React, { Suspense, lazy, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  PatientIntakeApiData,
  mapApiToFieldContentRules,
  mapApiToDeliveryMethods,
  mapApiToAgentConfig,
  mapApiToFormsQuestionnaires,
  mapFieldContentRulesToApi,
  mapDeliveryMethodsToApi,
  mapAgentConfigToApi
} from "@/lib/patient-intake.mappers";

// Import types for better type safety
import type {
  FieldContentRulesTabData,
  DeliveryMethodsTabData,
  PatientAgentConfigTabData,
  FormsQuestionnairesTabData,
} from "@/lib/patient-intake.mappers";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FormsQuestionnairesTab = lazy(() => import("@/components/patient-intake/FormsQuestionnairesTab"));
const FieldContentRulesTab = lazy(() => import("@/components/patient-intake/FieldContentRulesTab"));
const DeliveryMethodsTab = lazy(() => import("@/components/patient-intake/DeliveryMethodsTab"));
const PatientWorkflowsTab = lazy(() => import("@/components/patient-intake/PatientWorkflowsTab"));
const PatientAgentConfigTab = lazy(() => import("@/components/patient-intake/PatientAgentConfigTab"));

export default function PatientIntakeAgent() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<PatientIntakeApiData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());

  // Refs used to call validation on Save Configuration
  const formsRef = React.useRef<any>(null);
  const rulesRef = React.useRef<any>(null);
  const deliveryRef = React.useRef<any>(null);
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
          () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
          2,
          1000
        );
        setAgentData(data.data);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Failed to fetch patient intake agent:', error);
        toast({
          title: "Error",
          description: "Failed to load patient intake configuration after retries",
          variant: "destructive",
        });
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
      // Validate all tabs (excluding forms which doesn't have API yet)
      const validations = await Promise.all([
        rulesRef.current?.validate?.(),
        deliveryRef.current?.validate?.(),
        agentConfigRef.current?.validate?.(),
        // Note: Forms tab validation skipped as API is not implemented yet
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

      // Get values from all tabs (excluding forms which doesn't have API yet)
      const tabValues = {
        rules: rulesRef.current?.getValues?.(),
        delivery: deliveryRef.current?.getValues?.(),
        agentConfig: agentConfigRef.current?.getValues?.(),
      };

      // Build update tasks with metadata (excluding forms which doesn't have API yet)
      const updateTasks: Array<{
        promise: Promise<any>;
        name: string;
        key: string;
      }> = [];

      const tabConfigs = [
        {
          key: 'rules',
          name: 'Field & Content Rules',
          apiFn: () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/field-requirements`,
            { ...mapFieldContentRulesToApi(tabValues.rules), current_version: agentData.current_version }),
          currentValues: mapApiToFieldContentRules(agentData),
          newValues: tabValues.rules,
        },
        {
          key: 'delivery',
          name: 'Delivery Methods',
          apiFn: () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/delivery-methods`,
            { ...mapDeliveryMethodsToApi(tabValues.delivery), current_version: agentData.current_version }),
          currentValues: mapApiToDeliveryMethods(agentData),
          newValues: tabValues.delivery,
        },
        {
          key: 'agentConfig',
          name: 'Agent Config',
          apiFn: () => api.put(`/api/v1/patient-intake-agent/${user.org_id}/agent-config`,
            { ...mapAgentConfigToApi(tabValues.agentConfig), current_version: agentData.current_version }),
          currentValues: mapApiToAgentConfig(agentData),
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
            () => api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as Promise<{ data: PatientIntakeApiData }>,
            1,
            500
          );
          setAgentData(updatedData.data);
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
      toast({
        title: "Save Failed",
        description: "An error occurred while saving. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setSavingTabs(new Set());
    }
  };

  // Individual save handlers for each tab
  const handleSaveFieldRequirements = async () => {
    if (!agentData || !user?.org_id) return;
    const validation = rulesRef.current?.validate?.();
    if (validation && !validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }
    const tabData = rulesRef.current?.getValues?.();
    if (tabData) {
      await api.put(`/api/v1/patient-intake-agent/${user.org_id}/field-requirements`,
        { ...mapFieldContentRulesToApi(tabData), current_version: agentData.current_version });
      toast({ title: "Success", description: "Field requirements saved successfully." });
      await refetchAgentData();
    }
  };

  const handleSaveDeliveryMethods = async () => {
    if (!agentData || !user?.org_id) return;
    const validation = deliveryRef.current?.validate?.();
    if (validation && !validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }
    const tabData = deliveryRef.current?.getValues?.();
    if (tabData) {
      await api.put(`/api/v1/patient-intake-agent/${user.org_id}/delivery-methods`,
        { ...mapDeliveryMethodsToApi(tabData), current_version: agentData.current_version });
      toast({ title: "Success", description: "Delivery methods saved successfully." });
      await refetchAgentData();
    }
  };

  const handleSaveAgentConfig = async () => {
    if (!agentData || !user?.org_id) return;
    const validation = agentConfigRef.current?.validate?.();
    if (validation && !validation.valid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }
    const tabData = agentConfigRef.current?.getValues?.();
    if (tabData) {
      await api.put(`/api/v1/patient-intake-agent/${user.org_id}/agent-config`,
        { ...mapAgentConfigToApi(tabData), current_version: agentData.current_version });
      toast({ title: "Success", description: "Agent configuration saved successfully." });
      await refetchAgentData();
    }
  };

  // Function to refetch agent data after save
  const refetchAgentData = async () => {
    if (!user?.org_id) return;
    try {
      const data = await api.get(`/api/v1/patient-intake-agent/${user.org_id}`) as { data: PatientIntakeApiData };
      setAgentData(data.data);
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
    rules: mapApiToFieldContentRules(agentData),
    delivery: mapApiToDeliveryMethods(agentData),
    agentConfig: mapApiToAgentConfig(agentData),
    forms: mapApiToFormsQuestionnaires(agentData),
  } : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
              <FileText className="h-8 w-8 text-[#1c275e]" />
              Patient Intake Agent
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Loading configuration...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c275e] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading patient intake configuration</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Enhanced Page Header with brand styling */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#1c275e]" />
            Patient Intake Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Streamlined patient registration and information collection
          </p>
        </div>
      </div>

      {/* Enhanced tabbed layout with brand styling */}
      <Tabs defaultValue="field-content-rules" className="w-full">
        {/* Improved tab navigation with brand styling */}
        <div className="bg-white rounded-none shadow-lg border border-gray-200 overflow-hidden mb-6">
          <TabsList className="w-full grid grid-cols-5 gap-0 bg-transparent h-12 m-0 p-0">
            <TabsTrigger
              value="forms-questionnaires"
              className="rounded-none data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-200 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
            >
              Forms & Questionnaires
            </TabsTrigger>
            <TabsTrigger
              value="field-content-rules"
              className="rounded-none data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-200 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
            >
              Field & Content Rules
            </TabsTrigger>
            <TabsTrigger
              value="delivery-methods"
              className="rounded-none data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-200 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
            >
              Delivery Methods
            </TabsTrigger>
            <TabsTrigger
              value="workflows"
              className="rounded-none data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-200 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
            >
              Workflows
            </TabsTrigger>
            <TabsTrigger
              value="agent-config"
              className="rounded-none data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-200 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
            >
              Agent Config
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Forms & Questionnaires tab */}
        <TabsContent value="forms-questionnaires">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FormsQuestionnairesTab
              ref={formsRef}
              initialValues={initialValues?.forms}
              onSave={undefined} // API not implemented yet
              isSaving={false} // Not applicable for forms tab
            />
          </Suspense>
        </TabsContent>

        {/* Field & Content Rules tab */}
        <TabsContent value="field-content-rules">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FieldContentRulesTab
              ref={rulesRef}
              initialData={initialValues?.rules}
              onSave={handleSaveFieldRequirements}
              isSaving={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Delivery Methods tab */}
        <TabsContent value="delivery-methods">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <DeliveryMethodsTab
              ref={deliveryRef}
              initialData={initialValues?.delivery}
              onSave={handleSaveDeliveryMethods}
              isSaving={isSaving}
            />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientWorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientAgentConfigTab
              ref={agentConfigRef}
              initialData={initialValues?.agentConfig}
              onSave={handleSaveAgentConfig}
              isSaving={isSaving}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}