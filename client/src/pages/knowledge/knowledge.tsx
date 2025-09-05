import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
const InputsTab = lazy(() => import("@/components/knowledge/InputsTab"));
const UploadDocumentsTab = lazy(() => import("@/components/knowledge/UploadDocumentsTab"));
const WebsitesTab = lazy(() => import("@/components/knowledge/WebsitesTab"));
const CuratedKnowledgeTab = lazy(() => import("@/components/knowledge/CuratedKnowledgeTab"));

export default function KnowledgeAgent() {
  const { toast } = useToast();

  // Refs used to call validation on Save Configuration
  const inputsRef = React.useRef<any>(null);
  const uploadRef = React.useRef<any>(null);
  const websitesRef = React.useRef<any>(null);
  const curatedRef = React.useRef<any>(null);

  // In a subsequent iteration, these will submit form data.
  const handleSave = (mode: "draft" | "final") => {
    if (mode === "final") {
      // Perform lightweight validation via tab components
      const inputsResult = inputsRef.current?.validate?.();
      const uploadResult = uploadRef.current?.validate?.();
      const websitesResult = websitesRef.current?.validate?.();
      const curatedResult = curatedRef.current?.validate?.();

      // Add validation checks here as needed
      // For now, just show success message
    }

    toast({
      title: mode === "draft" ? "Draft saved" : "Configuration saved",
      description:
        mode === "draft"
          ? "Your knowledge base progress was saved as a draft."
          : "Your knowledge base configuration has been saved.",
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate flex items-center gap-3">
            <Book className="h-8 w-8 text-indigo-600" />
            Knowledge Agent
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            AI-powered knowledge management and documentation
          </p>
        </div>
      </div>

      {/* Primary tabbed layout: 4 tabs for knowledge base configuration */}
      <Tabs defaultValue="inputs" className="w-full">
        {/* Spread tabs equally across the container to fill the row */}
        <TabsList className="w-full grid grid-cols-4 gap-0">
          <TabsTrigger value="inputs" className="w-full">Inputs</TabsTrigger>
          <TabsTrigger value="upload-documents" className="w-full">Upload Documents</TabsTrigger>
          <TabsTrigger value="websites" className="w-full">Websites</TabsTrigger>
          <TabsTrigger value="curated-knowledge" className="w-full">Curated Knowledge</TabsTrigger>
        </TabsList>

        {/* Inputs tab */}
        <TabsContent value="inputs">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <InputsTab ref={inputsRef} />
          </Suspense>
        </TabsContent>

        {/* Upload Documents tab */}
        <TabsContent value="upload-documents">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <UploadDocumentsTab ref={uploadRef} />
          </Suspense>
        </TabsContent>

        {/* Websites tab */}
        <TabsContent value="websites">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <WebsitesTab ref={websitesRef} />
          </Suspense>
        </TabsContent>

        {/* Curated Knowledge tab */}
        <TabsContent value="curated-knowledge">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
            <CuratedKnowledgeTab ref={curatedRef} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}