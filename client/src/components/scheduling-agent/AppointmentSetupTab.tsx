import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { usePermissions } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentSetupValues } from "@/types/schedulingAgent";

/**
 * AppointmentSetupTab
 * - Configuration options for appointment types and settings
 * - Mirrors the launchpad tab styling and structure
 * - Controlled component: receives values and onChange handler
 */
export type AppointmentSetupTabProps = {
  values: AppointmentSetupValues;
  onChange: (values: AppointmentSetupValues) => void;
  readOnly?: boolean;
};

const AppointmentSetupTab = ({ values, onChange, readOnly: readOnlyProp }: AppointmentSetupTabProps) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;
  const { toast } = useToast();


  return (
    <div className="space-y-6">
      {/* Enhanced Appointment Types Offered Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Appointment Types Offered</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure the types of appointments available for booking</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Appointment Type Toggles */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="new-patient-enabled" className="text-[#1c275e] font-medium">New Patient Appointments</Label>
              </div>
              <IOSSwitch
                id="new-patient-enabled"
                checked={values.appointmentTypes.newPatient}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      appointmentTypes: {
                        ...values.appointmentTypes,
                        newPatient: checked
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
                  <Users className="h-4 w-4 text-[#1c275e]" />
                </div>
                <Label htmlFor="follow-up-enabled" className="text-[#1c275e] font-medium">Follow-up Appointments</Label>
              </div>
              <IOSSwitch
                id="follow-up-enabled"
                checked={values.appointmentTypes.followUp}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      appointmentTypes: {
                        ...values.appointmentTypes,
                        followUp: checked
                      }
                    });
                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#2a3570]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-[#2a3570]" />
                </div>
                <Label htmlFor="procedure-enabled" className="text-[#1c275e] font-medium">Procedure-Specific Appointments</Label>
              </div>
              <IOSSwitch
                id="procedure-enabled"
                checked={values.appointmentTypes.procedure}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      appointmentTypes: {
                        ...values.appointmentTypes,
                        procedure: checked
                      }
                    });
                  }
                }}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Enhanced Duration Configuration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1c275e] mb-4">Duration Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Row 1: New Patient and Follow-up Appointments */}
              <div className="space-y-2">
                <Label htmlFor="new-patient-duration" className="text-sm font-semibold text-[#1c275e]">New Patient Appointments</Label>
                <div className="relative">
                  <Input
                    id="new-patient-duration"
                    type="text"
                    placeholder="30"
                    value={values.newPatientDuration}
                    onChange={(e) => {
                      if (!readOnly) {
                        // Only allow numeric input
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        onChange({
                          ...values,
                          newPatientDuration: numericValue
                        });
                      }
                    }}
                    readOnly={readOnly}
                    className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024] pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    minutes
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="follow-up-duration" className="text-sm font-semibold text-[#1c275e]">Follow-up Appointments</Label>
                <div className="relative">
                  <Input
                    id="follow-up-duration"
                    type="text"
                    placeholder="15"
                    value={values.followUpDuration}
                    onChange={(e) => {
                      if (!readOnly) {
                        // Only allow numeric input
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        onChange({
                          ...values,
                          followUpDuration: numericValue
                        });
                      }
                    }}
                    readOnly={readOnly}
                    className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024] pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    minutes
                  </span>
                </div>
              </div>

              {/* Row 2: Procedure-Specific and Duration */}
              <div className="space-y-2">
                <Label htmlFor="procedure-specific" className="text-sm font-semibold text-[#1c275e]">Procedure-Specific</Label>
                <Input
                  id="procedure-specific"
                  placeholder="Enter procedure type"
                  value={values.procedureSpecific}
                  onChange={(e) => {
                    if (!readOnly) {
                      onChange({
                        ...values,
                        procedureSpecific: e.target.value
                      });
                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedure-duration" className="text-sm font-semibold text-[#1c275e]">Duration</Label>
                <div className="relative">
                  <Input
                    id="procedure-duration"
                    type="text"
                    placeholder="60"
                    value={values.procedureDuration}
                    onChange={(e) => {
                      if (!readOnly) {
                        // Only allow numeric input
                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                        onChange({
                          ...values,
                          procedureDuration: numericValue
                        });
                      }
                    }}
                    readOnly={readOnly}
                    className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024] pr-16"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Appointment Capacity Rules Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Appointment Capacity Rules</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Set limits on appointment bookings</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Capacity Rules */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1c275e] mb-4">Daily Capacity Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="max-new-patients" className="text-sm font-semibold text-[#1c275e]">Max New Patients per day</Label>
                <Input
                  id="max-new-patients"
                  type="text"
                  placeholder="10"
                  value={values.maxNewPatients}
                  onChange={(e) => {
                    if (!readOnly) {
                      // Only allow numeric input
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      onChange({
                        ...values,
                        maxNewPatients: numericValue
                      });
                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-follow-ups" className="text-sm font-semibold text-[#1c275e]">Max Follow-ups per day</Label>
                <Input
                  id="max-follow-ups"
                  type="text"
                  placeholder="20"
                  value={values.maxFollowUps}
                  onChange={(e) => {
                    if (!readOnly) {
                      // Only allow numeric input
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      onChange({
                        ...values,
                        maxFollowUps: numericValue
                      });
                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentSetupTab;
