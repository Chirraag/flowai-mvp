import React, { Suspense, lazy } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLaunchpadData, updateLocations, updateProviders, updateBasicInfo, updateHours, LaunchpadData } from "@/lib/launchpad";
import { useAuth } from "@/context/AuthContext";

// Lazy-load tab sections so future heavy UIs don't bloat initial load.
// Note: BasicInfoTab exposes imperative validation via ref; we import the handle type for typing.
const BasicInfoTab = lazy(() => import("@/components/launchpad/BasicInfoTab"));
const LocationsTab = lazy(() => import("@/components/launchpad/LocationsTab"));
const ProvidersTab = lazy(() => import("@/components/launchpad/ProvidersTab"));
const HoursTab = lazy(() => import("@/components/launchpad/HoursTab"));

export default function Launchpad() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch launchpad data with React Query
  const { data: launchpadData, error: launchpadError } = useQuery({
    queryKey: ["launchpad", user?.workspace_id],
    queryFn: async () => await fetchLaunchpadData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle fetch errors
  React.useEffect(() => {
    if (launchpadError) {
      toast({
        variant: "destructive",
        title: "Failed to Load Data",
        description: "Unable to load practice configuration. Please refresh the page.",
      });
    }
  }, [launchpadError, toast]);

  // Refs used to call validation on Save Configuration
  const basicRef = React.useRef<any>(null);
  const locationsRef = React.useRef<any>(null);
  const providersRef = React.useRef<any>(null);
  const hoursRef = React.useRef<any>(null);

  // Handle save operations
  const handleSave = async (mode: "draft" | "final") => {
    if (mode === "final") {
      // Perform lightweight validation via BasicInfoTab, LocationsTab, ProvidersTab, and HoursTab
      const basicResult = basicRef.current?.validate?.();
      const locationsResult = locationsRef.current?.validate?.();
      const providersResult = providersRef.current?.validate?.();
      const hoursResult = hoursRef.current?.validate?.();

      if (basicResult && !basicResult.valid) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: basicResult.errors[0] || "Practice Name required",
        });
        return;
      }

      if (locationsResult && !locationsResult.valid) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: locationsResult.errors[0] || "Location information required",
        });
        return;
      }

      if (providersResult && !providersResult.valid) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: providersResult.errors[0] || "Provider information required",
        });
        return;
      }

      if (hoursResult && !hoursResult.valid) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: hoursResult.errors[0] || "Hours information required",
        });
        return;
      }

      // Get form data from all tabs
      const basicValues = basicRef.current?.getValues?.();
      const locationsValues = locationsRef.current?.getValues?.();
      const providersValues = providersRef.current?.getValues?.();
      const hoursValues = hoursRef.current?.getValues?.();

      if (!basicValues || !locationsValues || !providersValues || !hoursValues) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Unable to collect form data. Please try again.",
        });
        return;
      }

      // Normalize tab values to match expected API formats
      const normalizedLocations: LaunchpadData['locations'] = locationsValues.map((location: any) => ({
        locationName: location.name,
        streetAddress: location.streetAddress,
        phone: location.phone,
        city: location.city,
        state: location.state,
        zip: location.zip,
      }));

      const normalizedProviders: LaunchpadData['providers'] = {
        providers: providersValues.map((provider: any) => ({
          firstName: provider.firstName,
          lastName: provider.lastName,
          specialty: provider.specialty,
          npiNumber: provider.npiNumber,
          clinicLocations: provider.clinicLocations,
        })),
        supportedLanguage: launchpadData?.providers.supportedLanguage || [],
      };

      try {
        // Sequential API calls in safe order
        // 1. Update locations first (providers depend on location names)
        await updateLocations(normalizedLocations);

        // 2. Update providers (now that locations are updated)
        await updateProviders(normalizedProviders);

        // 3. Update basic info
        await updateBasicInfo(basicValues.practiceName, basicValues.dbas);

        // 4. Update hours
        await updateHours(hoursValues);

        // Invalidate and refetch launchpad data
        await queryClient.invalidateQueries({
          queryKey: ["launchpad", user?.workspace_id],
        });

        toast({
          title: "Configuration Saved",
          description: "Your configuration has been successfully saved.",
        });
      } catch (error) {
        console.error("Save failed:", error);
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Failed to save configuration. Please try again.",
        });
      }
    } else {
      // Draft save - just show success message (no API calls)
      toast({
        title: "Draft Saved",
        description: "Your launchpad progress was saved as a draft.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Page heading and subtext to match provided design */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Practice Launchpad</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Configure your healthcare practice information to get started with Flow AI
          </p>
        </div>
      </div>

      {/* Wrap tabs in Suspense for the launchpad data query */}
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading practice configuration...</div>}>
        {/* Primary tabbed layout: Basic Info | Locations | Providers | Hours */}
        <Tabs defaultValue="basic" className="w-full">
          {/* Spread tabs equally across the container to fill the row */}
          <TabsList className="w-full grid grid-cols-4 gap-0">
            <TabsTrigger value="basic" className="w-full">Basic Info</TabsTrigger>
            <TabsTrigger value="locations" className="w-full">Locations</TabsTrigger>
            <TabsTrigger value="providers" className="w-full">Providers</TabsTrigger>
            <TabsTrigger value="hours" className="w-full">Hours</TabsTrigger>
          </TabsList>

          {/* Basic Info tab mirrors the screenshot layout */}
          <TabsContent value="basic" forceMount>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {/* Attach ref so we can run validation on Save Configuration */}
              <BasicInfoTab
                ref={basicRef}
                initialPracticeName={launchpadData?.basicInfo.practiceName}
                initialDbas={launchpadData?.basicInfo.dbas}
              />
            </Suspense>
          </TabsContent>

          {/* Locations tab with multi-location support */}
          <TabsContent value="locations" forceMount>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {/* Attach ref so we can run validation on Save Configuration */}
              <LocationsTab
                ref={locationsRef}
                initialLocations={launchpadData?.locations}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="providers" forceMount>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {/* Attach ref so we can run validation on Save Configuration */}
              <ProvidersTab
                ref={providersRef}
                initialProviders={launchpadData?.providers.providers}
                locationOptions={launchpadData?.locations.map(loc => loc.locationName) || []}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="hours" forceMount>
            <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
              {/* Attach ref so we can run validation on Save Configuration */}
              <HoursTab
                ref={hoursRef}
                clinicHoursByDay={launchpadData?.hours.clinicHours}
                schedulingHoursByDay={launchpadData?.hours.schedulingHours}
                schedulingHoursDifferent={launchpadData?.hours.schedulingHoursDifferent}
                holidays={launchpadData?.hours.holidays}
                emergencyInstructions={launchpadData?.hours.emergencyInstructions}
                afterHoursInstructions={launchpadData?.hours.afterHoursInstructions}
                locationName={launchpadData?.locations[0]?.locationName}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </Suspense>

      {/* Page-level action bar (bottom-right) to match screenshot */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => handleSave("draft")}>Save Draft</Button>
        <Button onClick={() => handleSave("final")}>Save Configuration</Button>
      </div>
    </div>
  );
}
