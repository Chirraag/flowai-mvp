import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
 */
export type AppointmentSetupTabProps = {
  initialValues?: AppointmentSetupValues;
  onSave?: (values: AppointmentSetupValues) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

export type AppointmentSetupTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => AppointmentSetupValues;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const AppointmentSetupTab = forwardRef<AppointmentSetupTabHandle, AppointmentSetupTabProps>(({ initialValues, onSave, isSaving = false, readOnly: readOnlyProp }, ref) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;
  const { toast } = useToast();
  const [newPatientDuration, setNewPatientDuration] = React.useState("");
  const [followUpDuration, setFollowUpDuration] = React.useState("");
  const [procedureSpecific, setProcedureSpecific] = React.useState("");
  const [procedureDuration, setProcedureDuration] = React.useState("");
  const [maxNewPatients, setMaxNewPatients] = React.useState("");
  const [maxFollowUps, setMaxFollowUps] = React.useState("");

  // Appointment type toggles
  const [newPatientEnabled, setNewPatientEnabled] = React.useState(false);
  const [followUpEnabled, setFollowUpEnabled] = React.useState(false);
  const [procedureEnabled, setProcedureEnabled] = React.useState(false);

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Set initial values when props change
  useEffect(() => {
    if (initialValues) {
      setNewPatientDuration(initialValues.newPatientDuration);
      setFollowUpDuration(initialValues.followUpDuration);
      setProcedureSpecific(initialValues.procedureSpecific);
      setProcedureDuration(initialValues.procedureDuration);
      setMaxNewPatients(initialValues.maxNewPatients);
      setMaxFollowUps(initialValues.maxFollowUps);
      setNewPatientEnabled(initialValues.appointmentTypes.newPatient);
      setFollowUpEnabled(initialValues.appointmentTypes.followUp);
      setProcedureEnabled(initialValues.appointmentTypes.procedure);
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

    const currentRef = (ref as React.MutableRefObject<AppointmentSetupTabHandle | null>).current;
    const validation = currentRef?.validate();
    if (validation && !validation.valid) {
      // Show validation errors to user
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      newPatientDuration,
      followUpDuration,
      procedureSpecific,
      procedureDuration,
      maxNewPatients,
      maxFollowUps,
      appointmentTypes: {
        newPatient: newPatientEnabled,
        followUp: followUpEnabled,
        procedure: procedureEnabled,
      },
    }),
    validate: () => {
      const errors: string[] = [];

      if (!maxNewPatients || maxNewPatients.trim() === "") {
        errors.push("Max new patients per day is required");
      } else if (parseInt(maxNewPatients) <= 0) {
        errors.push("Max new patients must be a positive number");
      }

      if (!maxFollowUps || maxFollowUps.trim() === "") {
        errors.push("Max follow-ups per day is required");
      } else if (parseInt(maxFollowUps) <= 0) {
        errors.push("Max follow-ups must be a positive number");
      }

      return { valid: errors.length === 0, errors };
    },
  }));

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
            {onSave && !readOnly && (
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
                  className="bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
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
                checked={newPatientEnabled}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setNewPatientEnabled(checked);
                    handleFieldChange();
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
                checked={followUpEnabled}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setFollowUpEnabled(checked);
                    handleFieldChange();
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
                checked={procedureEnabled}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setProcedureEnabled(checked);
                    handleFieldChange();
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
                <Select value={newPatientDuration} onValueChange={(value) => {
                  if (!readOnly) {
                    setNewPatientDuration(value);
                    handleFieldChange();
                  }
                }} disabled={readOnly}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="follow-up-duration" className="text-sm font-semibold text-[#1c275e]">Follow-up Appointments</Label>
                <Select value={followUpDuration} onValueChange={(value) => {
                  if (!readOnly) {
                    setFollowUpDuration(value);
                    handleFieldChange();
                  }
                }} disabled={readOnly}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Procedure-Specific and Duration */}
              <div className="space-y-2">
                <Label htmlFor="procedure-specific" className="text-sm font-semibold text-[#1c275e]">Procedure-Specific</Label>
                <Input
                  id="procedure-specific"
                  placeholder="Enter procedure type"
                  value={procedureSpecific}
                  onChange={(e) => {
                    if (!readOnly) {
                      setProcedureSpecific(e.target.value);
                      handleFieldChange();
                    }
                  }}
                  readOnly={readOnly}
                  className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedure-duration" className="text-sm font-semibold text-[#1c275e]">Duration</Label>
                <Select value={procedureDuration} onValueChange={(value) => {
                  if (!readOnly) {
                    setProcedureDuration(value);
                    handleFieldChange();
                  }
                }} disabled={readOnly}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
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
                  value={maxNewPatients}
                  onChange={(e) => {
                    if (!readOnly) {
                      // Only allow numeric input
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      setMaxNewPatients(numericValue);
                      handleFieldChange();
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
                  value={maxFollowUps}
                  onChange={(e) => {
                    if (!readOnly) {
                      // Only allow numeric input
                      const numericValue = e.target.value.replace(/[^0-9]/g, '');
                      setMaxFollowUps(numericValue);
                      handleFieldChange();
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
});

export default AppointmentSetupTab;
