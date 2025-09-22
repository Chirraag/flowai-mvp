import React, { Suspense, lazy, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  PatientIntakeApiData,
  mapApiToFieldContentRules,
  mapApiToDeliveryMethods,
  mapApiToAgentConfig,
  mapFieldContentRulesToApi,
  mapDeliveryMethodsToApi,
  mapAgentConfigToApi
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
  const [initialData, setInitialData] = useState<PatientIntakeApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({
    fieldRequirements: false,
    deliveryMethods: false,
    agentConfig: false,
  });

  const orgId = user?.org_id;

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!orgId) return;

      try {
        const response = await api.get(`/api/v1/patient-intake-agent/${orgId}`) as { data: PatientIntakeApiData };
        setInitialData(response.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load patient intake configuration. Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching patient intake data:", error);
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
      const response = await api.get(`/api/v1/patient-intake-agent/${orgId}`) as { data: PatientIntakeApiData };
      setInitialData(response.data);
    } catch (error: any) {
      console.error("Error refetching data:", error);
    }
  };

  // Save handlers for each tab
  const handleSaveFieldRequirements = async () => {
    if (!rulesRef.current || !orgId) return;
    const validation = rulesRef.current.validate();
    if (!validation.valid) {
      toast({ title: "Validation Error", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }
    setIsSaving((prev) => ({ ...prev, fieldRequirements: true }));
    try {
      const tabData = rulesRef.current.getValues();
      const payload = { ...mapFieldContentRulesToApi(tabData), current_version: initialData?.current_version || 1 };
      await api.put(`/api/v1/patient-intake-agent/${orgId}/field-requirements`, payload);
      toast({ title: "Success", description: "Field requirements saved successfully." });
      await refetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save field requirements.", variant: "destructive" });
      console.error("Error saving field requirements:", error);
    } finally {
      setIsSaving((prev) => ({ ...prev, fieldRequirements: false }));
    }
  };

  const handleSaveDeliveryMethods = async () => {
    if (!deliveryRef.current || !orgId) return;
    const validation = deliveryRef.current.validate();
    if (!validation.valid) {
      toast({ title: "Validation Error", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }
    setIsSaving((prev) => ({ ...prev, deliveryMethods: true }));
    try {
      const tabData = deliveryRef.current.getValues();
      const payload = { ...mapDeliveryMethodsToApi(tabData), current_version: initialData?.current_version || 1 };
      await api.put(`/api/v1/patient-intake-agent/${orgId}/delivery-methods`, payload);
      toast({ title: "Success", description: "Delivery methods saved successfully." });
      await refetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save delivery methods.", variant: "destructive" });
      console.error("Error saving delivery methods:", error);
    } finally {
      setIsSaving((prev) => ({ ...prev, deliveryMethods: false }));
    }
  };

  const handleSaveAgentConfig = async () => {
    if (!agentConfigRef.current || !orgId) return;
    const validation = agentConfigRef.current.validate();
    if (!validation.valid) {
      toast({ title: "Validation Error", description: validation.errors.join(", "), variant: "destructive" });
      return;
    }
    setIsSaving((prev) => ({ ...prev, agentConfig: true }));
    try {
      const tabData = agentConfigRef.current.getValues();
      const payload = { ...mapAgentConfigToApi(tabData), current_version: initialData?.current_version || 1 };
      await api.put(`/api/v1/patient-intake-agent/${orgId}/agent-config`, payload);
      toast({ title: "Success", description: "Agent configuration saved successfully." });
      await refetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to save agent configuration.", variant: "destructive" });
      console.error("Error saving agent config:", error);
    } finally {
      setIsSaving((prev) => ({ ...prev, agentConfig: false }));
    }
  };

  // Refs used to call validation on Save Configuration
  const formsRef = React.useRef<any>(null);
  const rulesRef = React.useRef<any>(null);
  const deliveryRef = React.useRef<any>(null);
  const workflowsRef = React.useRef<any>(null);
  const agentConfigRef = React.useRef<any>(null);


  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <FileText className="h-8 w-8 text-green-600" />
            Patient Intake Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Streamlined patient registration and information collection
          </p>
        </div>
      </div>

      {/* Primary tabbed layout: 5 tabs for patient intake configuration */}
      <Tabs defaultValue="forms-questionnaires" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-5 gap-0">
          <TabsTrigger value="forms-questionnaires" className="w-full">Forms & Questionnaires</TabsTrigger>
          <TabsTrigger value="field-content-rules" className="w-full">Field & Content Rules</TabsTrigger>
          <TabsTrigger value="delivery-methods" className="w-full">Delivery Methods</TabsTrigger>
          <TabsTrigger value="workflows" className="w-full">Workflows</TabsTrigger>
          <TabsTrigger value="agent-config" className="w-full">Agent Config</TabsTrigger>
        </TabsList>

        {/* Forms & Questionnaires tab */}
        <TabsContent value="forms-questionnaires">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FormsQuestionnairesTab ref={formsRef} />
          </Suspense>
        </TabsContent>

        {/* Field & Content Rules tab */}
        <TabsContent value="field-content-rules">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleSaveFieldRequirements} disabled={isSaving.fieldRequirements}>
                {isSaving.fieldRequirements ? "Saving..." : "Save Field Requirements"}
              </Button>
            </div>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {initialData && <FieldContentRulesTab ref={rulesRef} initialData={mapApiToFieldContentRules(initialData)} />}
            </Suspense>
          </div>
        </TabsContent>

        {/* Delivery Methods tab */}
        <TabsContent value="delivery-methods">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleSaveDeliveryMethods} disabled={isSaving.deliveryMethods}>
                {isSaving.deliveryMethods ? "Saving..." : "Save Delivery Methods"}
              </Button>
            </div>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {initialData && <DeliveryMethodsTab ref={deliveryRef} initialData={mapApiToDeliveryMethods(initialData)} />}
            </Suspense>
          </div>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientWorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          {/* <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleSaveAgentConfig} disabled={isSaving.agentConfig}>
                {isSaving.agentConfig ? "Saving..." : "Save Agent Config"}
              </Button>
            </div>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {initialData && <PatientAgentConfigTab ref={agentConfigRef} initialData={mapApiToAgentConfig(initialData)} />}
            </Suspense>
          </div> */}
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            {initialData && <PatientAgentConfigTab ref={agentConfigRef} initialData={mapApiToAgentConfig(initialData)} />}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}