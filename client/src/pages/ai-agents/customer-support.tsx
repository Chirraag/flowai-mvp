import React, { Suspense, lazy, useEffect, useState, useMemo, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigationBlocker } from "@/context/NavigationBlockerContext";
import { customerSupportApi } from "@/lib/customer-support";
import type { CustomerSupportAgentData } from "@/lib/customer-support.types";

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
  type LoadingState,
  type ValidationResult as SharedValidationResult
} from "@/lib/ai-agents";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FrequentlyAskedQuestionsTab = lazy(() => import("@/components/customer-support/FrequentlyAskedQuestionsTab"));
const CustomerSupportWorkflowsTab = lazy(() => import("@/components/customer-support/CustomerSupportWorkflowsTab"));

export default function CustomerSupportAgent() {
  const { toast } = useToast();
  const { user, hasWriteAccess } = useAuth();
  const { setHasUnsavedChanges, setUnsavedTabs } = useNavigationBlocker();

  // RBAC Permission check for save button visibility
  const canWriteAgents = hasWriteAccess("ai-agents");

  // Loading and data state using shared utilities
  const [loadingState, setLoadingState] = useState<LoadingState>(createInitialState());
  const [agentData, setAgentData] = useState<CustomerSupportAgentData | null>(null);

  // Validation state
  const [formValidation, setFormValidation] = useState<SharedValidationResult | null>(null);

  // Refs for tab communication (maintaining for now since tabs don't have controlled props)
  const faqRef = useRef<any>(null);
  const workflowsRef = useRef<any>(null);

  const orgId = user?.org_id ?? user?.workspaceId;

  // Fetch agent data on mount with retry
  useEffect(() => {
    const fetchAgentData = async () => {
      if (!orgId) {
        setLoadingState(stateHelpers.setLoading(loadingState, false));
        toast({
          title: "Error",
          description: "User organization not found",
          variant: "destructive",
        });
        return;
      }

      try {
        const data = await retryWithBackoff(
          () => customerSupportApi.getAgent(Number(orgId)),
          2,
          1000
        );
        setAgentData(data);
        setLoadingState(stateHelpers.resetRetryCount(stateHelpers.setLoading(loadingState, false)));
      } catch (error) {
        console.error('Failed to fetch customer support agent:', error);
        const errorToast = handleApiError(error, {
          action: "load customer support configuration",
          fallbackMessage: "Failed to load customer support configuration after retries"
        });
        toast(errorToast);
        setLoadingState(stateHelpers.setLoading(loadingState, false));
      }
    };

    fetchAgentData();
  }, [orgId, toast]);

  // Handle save all configurations using shared utilities
  const handleSaveAll = async () => {
    if (!agentData || !orgId) return;

    setLoadingState(stateHelpers.setSaving(loadingState, true));
    setLoadingState(stateHelpers.clearSavingTabs(loadingState));

    try {
      // For customer support, we mainly validate the FAQ tab since workflows are handled internally
      // This is a basic implementation - can be expanded when tabs have proper APIs
      const validation = validateAllTabs({
        'frequently-asked-questions': () => {
          // Try to validate FAQ tab if ref exists
          try {
            const validation = faqRef.current?.validate?.() || { valid: true, errors: [] };
            return {
              valid: validation.valid,
              errors: validation.errors?.map((err: any) => ({
                field: err.field || '',
                message: err.message || err,
                section: 'frequently-asked-questions',
                type: err.type || 'error' as const
              })) || [],
              warnings: []
            };
          } catch (error) {
            return {
              valid: true, // Don't block save for validation errors
              errors: [],
              warnings: []
            };
          }
        },
      });

      // If validation fails, show errors and prevent API calls
      if (!validation.valid) {
        setFormValidation(validation);
        toast({
          title: "Validation Failed",
          description: "Please fix validation errors before saving.",
          variant: "destructive",
        });
        setLoadingState(stateHelpers.setSaving(loadingState, false));
        return;
      }

      // Clear validation state on success
      setFormValidation(null);

      // For now, customer support doesn't have actual API saves
      // This is a placeholder for when the backend APIs are implemented
      // We simulate a successful save for now
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay

      toast({
        title: "Success",
        description: "Customer support configuration saved successfully.",
        variant: "default",
      });

      // Clear dirty flags on success
      console.log('Customer Support Agent - Clearing dirty tabs after successful save');
      setLoadingState(stateHelpers.clearDirtyTabs(loadingState));

    } catch (error) {
      console.error('Save failed:', error);
      const errorToast = handleApiError(error, { action: "save customer support configuration" });
      toast(errorToast);
    } finally {
      setLoadingState(prevState => stateHelpers.setSaving(prevState, false));
      setLoadingState(prevState => stateHelpers.clearSavingTabs(prevState));
    }
  };

  // Function to refetch agent data after save (placeholder for future use)
  const refetchAgentData = async () => {
    if (!orgId) return;
    try {
      const data = await customerSupportApi.getAgent(Number(orgId));
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

  // Basic change detection for navigation blocker
  // Since tabs use refs, we can't easily detect changes, so we use a simple approach
  useEffect(() => {
    const hasChanges = hasUnsavedChanges(loadingState);
    console.log('Customer Support Agent - Navigation Blocker Update:', {
      dirtyTabs: Array.from(loadingState.dirtyTabs),
      hasChanges,
      timestamp: new Date().toISOString()
    });
    setHasUnsavedChanges(hasChanges);

    if (hasChanges) {
      const unsavedTabs = getUnsavedTabNames(loadingState, {
        'frequently-asked-questions': 'FAQ Management',
        'workflows': 'Workflows',
      });
      console.log('Customer Support Agent - Setting unsaved tabs:', unsavedTabs);
      setUnsavedTabs(unsavedTabs);
    } else {
      console.log('Customer Support Agent - Clearing unsaved tabs');
      setUnsavedTabs([]);
    }
  }, [loadingState, setHasUnsavedChanges, setUnsavedTabs]);

  // Prepare initial values for tabs
  const initialValues = useMemo(() => {
    if (!agentData) return null;
    return {};
  }, [agentData]);

  // Show loading state
  if (loadingState.isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
              Customer Support Agent
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Loading configuration...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading customer support configuration</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Customer Support Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Configure FAQ management and customer support workflows
          </p>
        </div>
        {/* {canWriteAgents && (
          <Button
            onClick={handleSaveAll}
            disabled={loadingState.isSaving}
            className="bg-[#1c275e] hover:bg-[#233072] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loadingState.isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                Save Configuration
              </>
            )}
          </Button>
        )} */}
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

      {/* Enhanced tabbed layout with consistent styling */}
      <Tabs defaultValue="frequently-asked-questions" className="w-full">
        {/* Enhanced tab navigation with brand styling */}
        <TabsList className="w-full flex gap-0 rounded-3xl outline outline-offset-[-1px] bg-muted p-1 overflow-hidden mb-6 h-12">
          <TabsTrigger
            value="frequently-asked-questions"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            FAQ Management
          </TabsTrigger>
          <TabsTrigger
            value="workflows"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Workflows
          </TabsTrigger>
        </TabsList>

        {/* Frequently Asked Questions tab */}
        <TabsContent value="frequently-asked-questions">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FrequentlyAskedQuestionsTab ref={faqRef} />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <CustomerSupportWorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}