import React, { Suspense, lazy, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { apiToUi, uiToApi } from "@/lib/customer-support.mappers";
import { customerSupportApi } from "@/lib/customer-support";
import type { CustomerSupportAgentData, CustomerSupportAgentConfig } from "@/lib/customer-support.types";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FrequentlyAskedQuestionsTab = lazy(() => import("@/components/customer-support/FrequentlyAskedQuestionsTab"));
const CustomerSupportAgentConfigTab = lazy(() => import("@/components/customer-support/CustomerSupportAgentConfigTab"));
const CustomerSupportWorkflowsTab = lazy(() => import("@/components/customer-support/CustomerSupportWorkflowsTab"));

export default function CustomerSupportAgent() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Loading and data state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [agentData, setAgentData] = useState<CustomerSupportAgentData | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());
  const [savingTabs, setSavingTabs] = useState<Set<string>>(new Set());

  // Refs used to call validation on Save Configuration
  const agentConfigRef = React.useRef<any>(null);
  const faqRef = React.useRef<any>(null);
  const workflowsRef = React.useRef<any>(null);

  const orgId = user?.org_id ?? user?.workspaceId;

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
      if (!orgId) {
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
          () => customerSupportApi.getAgent(Number(orgId)),
          2,
          1000
        );
        setAgentData(data);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Failed to fetch customer support agent:', error);
        toast({
          title: "Error",
          description: "Failed to load customer support configuration after retries",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [orgId, toast]);

  // Individual save handlers for each tab
  const handleSaveAgentConfig = async (values: CustomerSupportAgentConfig) => {
    if (!agentData || !orgId) return;

    try {
      // Save each field separately using the individual APIs
      if (values.agent_name) {
        await customerSupportApi.updateAgentName(Number(orgId), values.agent_name);
      }
      if (values.voice) {
        await customerSupportApi.updateVoice(Number(orgId), values.voice);
      }
      if (values.language) {
        await customerSupportApi.updateLanguage(Number(orgId), values.language);
      }
      if (values.agent_instructions || values.human_transfer_criteria) {
        await customerSupportApi.updateInstructions(
          Number(orgId),
          values.agent_instructions,
          values.human_transfer_criteria || ""
        );
      }

      toast({ title: "Success", description: "Agent configuration saved successfully." });
      await refetchAgentData();
    } catch (error) {
      console.error('Failed to save agent config:', error);
      throw error; // Re-throw to let the component handle it
    }
  };

  // Function to refetch agent data after save
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

  // Prepare initial values for tabs
  const initialValues = agentData ? {
    agentConfig: apiToUi.agentConfig(agentData),
  } : null;

  // Show loading state
  if (isLoading) {
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

      {/* Enhanced tabbed layout with consistent styling */}
      <Tabs defaultValue="agent-config" className="w-full">
        {/* Enhanced tab navigation with brand styling */}
        <TabsList className="w-full flex gap-0 rounded-3xl outline outline-offset-[-1px] bg-muted p-1 overflow-hidden mb-6 h-12">
          <TabsTrigger
            value="agent-config"
            className="flex-1 first:rounded-l-3xl last:rounded-r-3xl data-[state=active]:bg-[#1c275e] data-[state=active]:text-white transition-all duration-300 font-medium text-center h-full flex items-center justify-center px-1 py-0 text-xs sm:text-sm border-0 leading-none"
          >
            Agent Config
          </TabsTrigger>
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

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <CustomerSupportAgentConfigTab
              ref={agentConfigRef}
              initialData={initialValues?.agentConfig}
              onSave={handleSaveAgentConfig}
              isSaving={isSaving}
            />
          </Suspense>
        </TabsContent>

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