import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const SchedulingKPIsTab = lazy(() => import("@/components/analytics/SchedulingKPIsTab"));
const IntakeKPIsTab = lazy(() => import("@/components/analytics/IntakeKPIsTab"));
const CheckInKPIsTab = lazy(() => import("@/components/analytics/CheckInKPIsTab"));
const MetricDefinitionsTab = lazy(() => import("@/components/analytics/MetricDefinitionsTab"));

export default function AnalyticsAgent() {
  const { toast } = useToast();

  // Refs used to call validation on Save Configuration
  const schedulingRef = React.useRef<any>(null);
  const intakeRef = React.useRef<any>(null);
  const checkInRef = React.useRef<any>(null);
  const metricsRef = React.useRef<any>(null);


  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <FileText className="h-8 w-8 text-teal-600" />
            Analytics Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            AI-powered healthcare analytics and insights
          </p>
        </div>
      </div>

      {/* Primary tabbed layout: 4 tabs for analytics configuration */}
      <Tabs defaultValue="scheduling-kpis" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-4 gap-0">
          <TabsTrigger value="scheduling-kpis" className="w-full">Scheduling KPIs</TabsTrigger>
          <TabsTrigger value="intake-kpis" className="w-full">Intake KPIs</TabsTrigger>
          <TabsTrigger value="check-in-kpis" className="w-full">Check-in KPIs</TabsTrigger>
          <TabsTrigger value="metric-definitions" className="w-full">Metric Definitions</TabsTrigger>
        </TabsList>

        {/* Scheduling KPIs tab */}
        <TabsContent value="scheduling-kpis">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <SchedulingKPIsTab ref={schedulingRef} />
          </Suspense>
        </TabsContent>

        {/* Intake KPIs tab */}
        <TabsContent value="intake-kpis">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <IntakeKPIsTab ref={intakeRef} />
          </Suspense>
        </TabsContent>

        {/* Check-in KPIs tab */}
        <TabsContent value="check-in-kpis">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <CheckInKPIsTab ref={checkInRef} />
          </Suspense>
        </TabsContent>

        {/* Metric Definitions tab */}
        <TabsContent value="metric-definitions">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <MetricDefinitionsTab ref={metricsRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
  
    </div>
  );
}