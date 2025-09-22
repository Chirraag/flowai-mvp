import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users } from "lucide-react";
import type { ProviderPreferencesValues } from "@/types/schedulingAgent";

/**
 * ProviderPreferencesTab
 * - Provider preferences and scheduling restrictions
 * - Mirrors the launchpad tab styling and structure
 */
export type ProviderPreferencesTabProps = {
  initialValues?: ProviderPreferencesValues;
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

const ProviderPreferencesTab = forwardRef<ProviderPreferencesTabHandle, ProviderPreferencesTabProps>((props, ref) => {
  // Provider Preferences state
  const [providerBlackoutDates, setProviderBlackoutDates] = React.useState("");
  const [establishedPatientsOnlyDays, setEstablishedPatientsOnlyDays] = React.useState("");
  const [customSchedulingRules, setCustomSchedulingRules] = React.useState("");

  // Set initial values when props change
  useEffect(() => {
    if (props.initialValues) {
      setProviderBlackoutDates(props.initialValues.providerBlackoutDates);
      setEstablishedPatientsOnlyDays(props.initialValues.establishedPatientsOnlyDays);
      setCustomSchedulingRules(props.initialValues.customSchedulingRules);
    }
  }, [props.initialValues]);

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
      {/* Provider Preferences & Restrictions Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Provider Preferences & Restrictions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure provider-specific scheduling rules</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="blackout-dates">Provider Blackout Dates</Label>
              <Textarea
                id="blackout-dates"
                placeholder="Enter dates when the provider is unavailable (one per line)"
                value={providerBlackoutDates}
                onChange={(e) => setProviderBlackoutDates(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="established-only">Established Patients Only days</Label>
              <Textarea
                id="established-only"
                placeholder="Enter days when only established patients can be scheduled (one per line)"
                value={establishedPatientsOnlyDays}
                onChange={(e) => setEstablishedPatientsOnlyDays(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-rules">Custom Scheduling rules</Label>
              <Textarea
                id="custom-rules"
                placeholder="Enter custom scheduling rules and restrictions (one per line)"
                value={customSchedulingRules}
                onChange={(e) => setCustomSchedulingRules(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default ProviderPreferencesTab;
