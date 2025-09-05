import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Settings, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const AppointmentSetupTab = lazy(() => import("@/components/scheduling-agent/AppointmentSetupTab"));
const PatientEligibilityTab = lazy(() => import("@/components/scheduling-agent/PatientEligibilityTab"));
const SchedulingPoliciesTab = lazy(() => import("@/components/scheduling-agent/SchedulingPoliciesTab"));
const ProviderPreferencesTab = lazy(() => import("@/components/scheduling-agent/ProviderPreferencesTab"));
const WorkflowsTab = lazy(() => import("@/components/scheduling-agent/WorkflowsTab"));
const AgentConfigTab = lazy(() => import("@/components/scheduling-agent/AgentConfigTab"));

export default function SchedulingAgent() {
  const { toast } = useToast();

  // Refs used to call validation on Save Configuration
  const appointmentSetupRef = React.useRef<any>(null);
  const patientEligibilityRef = React.useRef<any>(null);
  const schedulingPoliciesRef = React.useRef<any>(null);
  const providerPreferencesRef = React.useRef<any>(null);
  const workflowsRef = React.useRef<any>(null);
  const agentConfigRef = React.useRef<any>(null);


  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            Scheduling Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            AI-powered appointment scheduling and calendar management
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

      {/* Primary tabbed layout: 6 tabs for scheduling configuration */}
      <Tabs defaultValue="appointment-setup" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-6 gap-0">
          <TabsTrigger value="appointment-setup" className="w-full">Appointment Setup</TabsTrigger>
          <TabsTrigger value="patient-eligibility" className="w-full">Patient & Eligibility</TabsTrigger>
          <TabsTrigger value="scheduling-policies" className="w-full">Scheduling Policies</TabsTrigger>
          <TabsTrigger value="provider-preferences" className="w-full">Provider Preferences</TabsTrigger>
          <TabsTrigger value="workflows" className="w-full">Workflows</TabsTrigger>
          <TabsTrigger value="agent-config" className="w-full">Agent Config</TabsTrigger>
        </TabsList>

        {/* Appointment Setup tab */}
        <TabsContent value="appointment-setup">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <AppointmentSetupTab ref={appointmentSetupRef} />
          </Suspense>
        </TabsContent>

        {/* Patient & Eligibility tab */}
        <TabsContent value="patient-eligibility">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <PatientEligibilityTab ref={patientEligibilityRef} />
          </Suspense>
        </TabsContent>

        {/* Scheduling Policies tab */}
        <TabsContent value="scheduling-policies">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <SchedulingPoliciesTab ref={schedulingPoliciesRef} />
          </Suspense>
        </TabsContent>

        {/* Provider Preferences tab */}
        <TabsContent value="provider-preferences">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <ProviderPreferencesTab ref={providerPreferencesRef} />
          </Suspense>
        </TabsContent>

        {/* Workflows tab */}
        <TabsContent value="workflows">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <WorkflowsTab ref={workflowsRef} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <AgentConfigTab ref={agentConfigRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}