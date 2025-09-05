import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FormsQuestionnairesTab = lazy(() => import("@/components/patient-intake/FormsQuestionnairesTab"));
const FieldContentRulesTab = lazy(() => import("@/components/patient-intake/FieldContentRulesTab"));
const DeliveryMethodsTab = lazy(() => import("@/components/patient-intake/DeliveryMethodsTab"));
const PatientWorkflowsTab = lazy(() => import("@/components/patient-intake/PatientWorkflowsTab"));
const PatientAgentConfigTab = lazy(() => import("@/components/patient-intake/PatientAgentConfigTab"));

export default function PatientIntakeAgent() {
  const { toast } = useToast();

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
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configure
          </Button>
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Start Agent
          </Button>
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
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FieldContentRulesTab ref={rulesRef} />
          </Suspense>
        </TabsContent>

        {/* Delivery Methods tab */}
        <TabsContent value="delivery-methods">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <DeliveryMethodsTab ref={deliveryRef} />
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
            <PatientAgentConfigTab ref={agentConfigRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}