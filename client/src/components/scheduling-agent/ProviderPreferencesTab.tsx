import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProviderPreferencesValues } from "@/types/schedulingAgent";

/**
 * ProviderPreferencesTab
 * - Provider preferences and scheduling restrictions
 * - Mirrors the launchpad tab styling and structure
 */
export type ProviderPreferencesTabProps = {
  initialValues?: ProviderPreferencesValues;
  onSave?: (values: ProviderPreferencesValues) => Promise<void>;
  isSaving?: boolean;
};

export type ProviderPreferencesTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => ProviderPreferencesValues;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const ProviderPreferencesTab = forwardRef<ProviderPreferencesTabHandle, ProviderPreferencesTabProps>(({ initialValues, onSave, isSaving = false }, ref) => {
  // Provider Preferences state
  const [providerBlackoutDates, setProviderBlackoutDates] = React.useState("");
  const [establishedPatientsOnlyDays, setEstablishedPatientsOnlyDays] = React.useState("");
  const [customSchedulingRules, setCustomSchedulingRules] = React.useState("");

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Set initial values when props change
  useEffect(() => {
    if (initialValues) {
      setProviderBlackoutDates(initialValues.providerBlackoutDates);
      setEstablishedPatientsOnlyDays(initialValues.establishedPatientsOnlyDays);
      setCustomSchedulingRules(initialValues.customSchedulingRules);
      setHasUnsavedChanges(false);
    }
  }, [initialValues]);

  // Track changes
  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<ProviderPreferencesTabHandle | null>).current;
    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      providerBlackoutDates,
      establishedPatientsOnlyDays,
      customSchedulingRules,
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Provider Preferences & Restrictions Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Provider Preferences & Restrictions</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure provider-specific scheduling rules</p>
              </div>
            </div>
            {onSave && (
              <div className="flex items-center gap-3">
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-[#f48024] rounded-full animate-pulse"></div>
                    <span className="text-gray-200">Unsaved changes</span>
                  </div>
                )}
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Provider Preferences Sections */}
          <div className="space-y-8">
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="blackout-dates" className="text-sm font-semibold text-[#1c275e]">Provider Blackout Dates</Label>
              </div>
              <Textarea
                id="blackout-dates"
                placeholder="Enter dates when the provider is unavailable (one per line)"
                value={providerBlackoutDates}
                onChange={(e) => {
                  setProviderBlackoutDates(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#1c275e]/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#1c275e]" />
                </div>
                <Label htmlFor="established-only" className="text-sm font-semibold text-[#1c275e]">Established Patients Only Days</Label>
              </div>
              <Textarea
                id="established-only"
                placeholder="Enter days when only established patients can be scheduled (one per line)"
                value={establishedPatientsOnlyDays}
                onChange={(e) => {
                  setEstablishedPatientsOnlyDays(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#2a3570]/20 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-[#2a3570]" />
                </div>
                <Label htmlFor="custom-rules" className="text-sm font-semibold text-[#1c275e]">Custom Scheduling Rules</Label>
              </div>
              <Textarea
                id="custom-rules"
                placeholder="Enter custom scheduling rules and restrictions (one per line)"
                value={customSchedulingRules}
                onChange={(e) => {
                  setCustomSchedulingRules(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ProviderPreferencesTab;
