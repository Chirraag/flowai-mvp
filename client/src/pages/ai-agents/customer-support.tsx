import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const FrequentlyAskedQuestionsTab = lazy(() => import("@/components/customer-support/FrequentlyAskedQuestionsTab"));
const KnowledgeBaseTrainingTab = lazy(() => import("@/components/customer-support/KnowledgeBaseTrainingTab"));
const CustomerSupportAgentConfigTab = lazy(() => import("@/components/customer-support/CustomerSupportAgentConfigTab"));

export default function CustomerSupportAgent() {
  const { toast } = useToast();

  // Refs used to call validation on Save Configuration
  const faqRef = React.useRef<any>(null);
  const knowledgeRef = React.useRef<any>(null);
  const agentConfigRef = React.useRef<any>(null);


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

      {/* Primary tabbed layout: 3 tabs for customer support configuration */}
      <Tabs defaultValue="frequently-asked-questions" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-3 gap-0">
          <TabsTrigger value="frequently-asked-questions" className="w-full">Frequently Asked Questions</TabsTrigger>
          <TabsTrigger value="knowledge-base-training" className="w-full">Knowledge Base & Training</TabsTrigger>
          <TabsTrigger value="agent-config" className="w-full">Agent Config</TabsTrigger>
        </TabsList>

        {/* Frequently Asked Questions tab */}
        <TabsContent value="frequently-asked-questions">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <FrequentlyAskedQuestionsTab ref={faqRef} />
          </Suspense>
        </TabsContent>

        {/* Knowledge Base & Training tab */}
        <TabsContent value="knowledge-base-training">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <KnowledgeBaseTrainingTab ref={knowledgeRef} />
          </Suspense>
        </TabsContent>

        {/* Agent Config tab */}
        <TabsContent value="agent-config">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <CustomerSupportAgentConfigTab ref={agentConfigRef} />
          </Suspense>
        </TabsContent>
      </Tabs>

    </div>
  );
}