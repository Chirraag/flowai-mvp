import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Clock, Users, Calendar, AlertCircle, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/context/AuthContext";
import type { SchedulingPoliciesValues } from "@/types/schedulingAgent";

/**
 * SchedulingPoliciesTab
 * - Walk-ins, same-day, and cancellation policies configuration
 * - Mirrors the launchpad tab styling and structure
 * - Controlled component: receives values and onChange handler
 */
export type SchedulingPoliciesTabProps = {
  values: SchedulingPoliciesValues;
  onChange: (values: SchedulingPoliciesValues) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

const SchedulingPoliciesTab = ({ values, onChange, onSave, isSaving = false, readOnly: readOnlyProp }: SchedulingPoliciesTabProps) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;
    await onSave();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Walk-ins & Same-day Policy Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Walk-ins & Same-day Policy</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure policies for urgent and same-day appointments</p>
              </div>
            </div>
            {onSave && !readOnly && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Policy Toggles */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="accept-walk-ins" className="text-[#1c275e] font-medium">Accept Walk-ins</Label>
              </div>
              <IOSSwitch
                id="accept-walk-ins"
                checked={values.walkInPolicy.acceptWalkIns}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      walkInPolicy: {
                        ...values.walkInPolicy,
                        acceptWalkIns: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1c275e]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#1c275e]" />
                </div>
                <Label htmlFor="same-day-appointments" className="text-[#1c275e] font-medium">Allow Same-day Appointments</Label>
              </div>
              <IOSSwitch
                id="same-day-appointments"
                checked={values.walkInPolicy.allowSameDayAppointments}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      walkInPolicy: {
                        ...values.walkInPolicy,
                        allowSameDayAppointments: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="cutoff-time" className="text-sm font-semibold text-[#1c275e]">Same-day Cutoff Time</Label>
              <div className="relative max-w-[120px]">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1c275e]" />
                <Input
                  id="cutoff-time"
                  type="time"
                  value={values.walkInPolicy.sameDayCutoffTime}
                  onChange={(e) => {
                    if (!readOnly) {
                      onChange({
                        ...values,
                        walkInPolicy: {
                          ...values.walkInPolicy,
                          sameDayCutoffTime: e.target.value
                        }
                      });

                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 pl-10 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced No-show & Cancellation Policy Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">No-show & Cancellation Policy</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Set policies for cancellations and no-shows</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Cancellation Policy Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1c275e] mb-4">Cancellation & No-Show Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cancellation-notice" className="text-sm font-semibold text-[#1c275e]">Minimum Cancellation Notice (hours)</Label>
                <Input
                  id="cancellation-notice"
                  type="number"
                  min="1"
                  placeholder="24"
                  value={values.cancellationPolicy.minimumCancellationNotice}
                  onChange={(e) => {
                    if (!readOnly) {
                      onChange({
                        ...values,
                        cancellationPolicy: {
                          ...values.cancellationPolicy,
                          minimumCancellationNotice: e.target.value
                        }
                      });

                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="no-show-fee" className="text-sm font-semibold text-[#1c275e]">No-show Fee</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1c275e] font-medium">$</span>
                  <Input
                    id="no-show-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50.00"
                    value={values.cancellationPolicy.noShowFee}
                    onChange={(e) => {
                      if (!readOnly) {
                        onChange({
                          ...values,
                          cancellationPolicy: {
                            ...values.cancellationPolicy,
                            noShowFee: e.target.value
                          }
                        });

                      }
                    }}
                    readOnly={readOnly}
                    className="h-11 pl-8 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulingPoliciesTab;
