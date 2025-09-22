import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Clock, Users } from "lucide-react";
import type { SchedulingPoliciesValues } from "@/types/schedulingAgent";

/**
 * SchedulingPoliciesTab
 * - Walk-ins, same-day, and cancellation policies configuration
 * - Mirrors the launchpad tab styling and structure
 */
export type SchedulingPoliciesTabProps = {
  initialValues?: SchedulingPoliciesValues;
};

export type SchedulingPoliciesTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => SchedulingPoliciesValues;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const SchedulingPoliciesTab = forwardRef<SchedulingPoliciesTabHandle, SchedulingPoliciesTabProps>((props, ref) => {
  // Walk-in Policy state
  const [acceptWalkIns, setAcceptWalkIns] = React.useState(true);
  const [allowSameDayAppointments, setAllowSameDayAppointments] = React.useState(true);
  const [sameDayCutoffTime, setSameDayCutoffTime] = React.useState("15:00");

  // Cancellation Policy state
  const [minimumCancellationNotice, setMinimumCancellationNotice] = React.useState("24");
  const [noShowFee, setNoShowFee] = React.useState("50");

  // Set initial values when props change
  useEffect(() => {
    if (props.initialValues) {
      setAcceptWalkIns(props.initialValues.walkInPolicy.acceptWalkIns);
      setAllowSameDayAppointments(props.initialValues.walkInPolicy.allowSameDayAppointments);
      setSameDayCutoffTime(props.initialValues.walkInPolicy.sameDayCutoffTime);
      setMinimumCancellationNotice(props.initialValues.cancellationPolicy.minimumCancellationNotice);
      setNoShowFee(props.initialValues.cancellationPolicy.noShowFee);
    }
  }, [props.initialValues]);

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      walkInPolicy: {
        acceptWalkIns,
        allowSameDayAppointments,
        sameDayCutoffTime,
      },
      cancellationPolicy: {
        minimumCancellationNotice,
        noShowFee,
      },
    }),
    validate: () => {
      const errors: string[] = [];

      if (!minimumCancellationNotice || parseInt(minimumCancellationNotice) <= 0) {
        errors.push("Minimum cancellation notice must be a positive number");
      }

      if (!noShowFee || parseFloat(noShowFee) < 0) {
        errors.push("No-show fee must be a non-negative number");
      }

      // Validate time format (HH:MM)
      if (!sameDayCutoffTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(sameDayCutoffTime)) {
        errors.push("Same-day cutoff time must be in HH:MM format");
      }

      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Walk-ins & Same-day Policy Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Walk-ins & Same-day Policy</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure policies for urgent and same-day appointments</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="accept-walk-ins" className="text-gray-900">Accept Walk-ins</Label>
              <IOSSwitch
                id="accept-walk-ins"
                checked={acceptWalkIns}
                onCheckedChange={setAcceptWalkIns}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="same-day-appointments" className="text-gray-900">Allow Same-day Appointments</Label>
              <IOSSwitch
                id="same-day-appointments"
                checked={allowSameDayAppointments}
                onCheckedChange={setAllowSameDayAppointments}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cutoff-time">Same-day Cutoff Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="cutoff-time"
                  type="time"
                  value={sameDayCutoffTime}
                  onChange={(e) => setSameDayCutoffTime(e.target.value)}
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No-show & Cancellation Policy Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">No-show & Cancellation Policy</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Set policies for cancellations and no-shows</p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cancellation-notice">Minimum Cancellation Notice (hours)</Label>
                <Input
                  id="cancellation-notice"
                  type="number"
                  min="1"
                  placeholder="24"
                  value={minimumCancellationNotice}
                  onChange={(e) => setMinimumCancellationNotice(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no-show-fee">No-show Fee ($)</Label>
                <Input
                  id="no-show-fee"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                  value={noShowFee}
                  onChange={(e) => setNoShowFee(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default SchedulingPoliciesTab;
