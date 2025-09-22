import React, { Suspense, lazy, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { CustomerSupportAgentData } from "@/lib/customer-support.types";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FrequentlyAskedQuestionsTab = lazy(() => import("@/components/customer-support/FrequentlyAskedQuestionsTab"));
const CustomerSupportAgentConfigTab = lazy(() => import("@/components/customer-support/CustomerSupportAgentConfigTab"));
const CustomerSupportWorkflowsTab = lazy(() => import("@/components/customer-support/CustomerSupportWorkflowsTab"));

export default function CustomerSupportAgent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<CustomerSupportAgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const orgId = user?.org_id ?? user?.workspaceId;

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;

      try {
        const response = await api.get(`/api/v1/customer-support-agent/${orgId}`) as { data: CustomerSupportAgentData };
        setInitialData(response.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load customer support configuration. Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching customer support data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast, orgId]);

  // Function to refetch data after successful save
  const refetchData = async () => {
    if (!orgId) return;

    try {
      const response = await api.get(`/api/v1/customer-support-agent/${orgId}`) as { data: CustomerSupportAgentData };
      setInitialData(response.data);
    } catch (error: any) {
      console.error("Error refetching data:", error);
    }
  };

  // Save handler for agent config (commented out as fields are now uneditable)
  // const handleSaveAgentConfig = async () => {
  //   if (!agentConfigRef.current || !orgId) return;
  //   const validation = agentConfigRef.current.validate();
  //   if (!validation.valid) {
  //     toast({ title: "Validation Error", description: validation.errors.join(", "), variant: "destructive" });
  //     return;
  //   }
  //   setIsSaving(true);
  //   try {
  //     const tabData = agentConfigRef.current.getValues();
  //     // Save each field separately using APIs from customersupport.md
  //     if (tabData.agentName) await api.put(`/api/v1/customer-support-agent/${orgId}/update-name`, { agent_name: tabData.agentName });
  //     if (tabData.voice) await api.put(`/api/v1/customer-support-agent/${orgId}/update-voice`, { voice: tabData.voice });
  //     if (tabData.language) await api.put(`/api/v1/customer-support-agent/${orgId}/update-language`, { language: tabData.language });
  //     await api.put(`/api/v1/customer-support-agent/${orgId}/update-instructions`, { agent_instructions: tabData.agentInstructions, human_transfer_criteria: tabData.humanTransferCriteria });
  //     toast({ title: "Success", description: "Agent configuration saved successfully." });
  //     await refetchData();
  //   } catch (error: any) {
  //     toast({ title: "Error", description: "Failed to save agent configuration.", variant: "destructive" });
  //     console.error("Error saving agent config:", error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // Refs used to call validation on Save Configuration
  const faqRef = React.useRef<any>(null);
  const agentConfigRef = React.useRef<any>(null);
  const workflowsRef = React.useRef<any>(null);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            Customer Support Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            AI-powered patient support and communication management
          </p>
        </div>
      </div>

      {/* Primary tabbed layout: 3 tabs for customer support configuration */}
      <Tabs defaultValue="frequently-asked-questions" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-3 gap-0">
          <TabsTrigger value="frequently-asked-questions" className="w-full">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="agent-config" className="w-full">Agent Config</TabsTrigger>
          <TabsTrigger value="workflows" className="w-full">Workflows</TabsTrigger>
        </TabsList>

        {/* Frequently Asked Questions tab */}
        <TabsContent value="frequently-asked-questions">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FrequentlyAskedQuestionsTab ref={faqRef} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          {/* <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleSaveAgentConfig} disabled={isSaving || loading}>
                {isSaving ? "Saving..." : "Save Agent Config"}
              </Button>
            </div>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {initialData && <CustomerSupportAgentConfigTab ref={agentConfigRef} initialData={{
                agentName: initialData.agent_name,
                language: initialData.language,
                voice: initialData.voice,
                agentInstructions: initialData.agent_instructions,
                humanTransferCriteria: initialData.human_transfer_criteria,
              }} />}
            </Suspense>
          </div> */}
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            {initialData && <CustomerSupportAgentConfigTab ref={agentConfigRef} initialData={{
              agentName: initialData.agent_name,
              language: initialData.language,
              voice: initialData.voice,
              agentInstructions: initialData.agent_instructions,
              humanTransferCriteria: initialData.human_transfer_criteria,
            }} />}
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