import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Calendar, Users } from "lucide-react";
import type { AppointmentSetupValues } from "@/types/schedulingAgent";

/**
 * AppointmentSetupTab
 * - Configuration options for appointment types and settings
 * - Mirrors the launchpad tab styling and structure
 */
export type AppointmentSetupTabProps = {
  initialValues?: AppointmentSetupValues;
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

const AppointmentSetupTab = forwardRef<AppointmentSetupTabHandle, AppointmentSetupTabProps>((props, ref) => {
  const [newPatientDuration, setNewPatientDuration] = React.useState("");
  const [followUpDuration, setFollowUpDuration] = React.useState("");
  const [procedureSpecific, setProcedureSpecific] = React.useState("");
  const [procedureDuration, setProcedureDuration] = React.useState("");
  const [maxNewPatients, setMaxNewPatients] = React.useState("");
  const [maxFollowUps, setMaxFollowUps] = React.useState("");

  // Appointment type toggles
  const [newPatientEnabled, setNewPatientEnabled] = React.useState(true);
  const [followUpEnabled, setFollowUpEnabled] = React.useState(true);
  const [procedureEnabled, setProcedureEnabled] = React.useState(false);

  // Set initial values when props change
  useEffect(() => {
    if (props.initialValues) {
      setNewPatientDuration(props.initialValues.newPatientDuration);
      setFollowUpDuration(props.initialValues.followUpDuration);
      setProcedureSpecific(props.initialValues.procedureSpecific);
      setProcedureDuration(props.initialValues.procedureDuration);
      setMaxNewPatients(props.initialValues.maxNewPatients);
      setMaxFollowUps(props.initialValues.maxFollowUps);
      setNewPatientEnabled(props.initialValues.appointmentTypes.newPatient);
      setFollowUpEnabled(props.initialValues.appointmentTypes.followUp);
      setProcedureEnabled(props.initialValues.appointmentTypes.procedure);
    }
  }, [props.initialValues]);

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

      if (maxNewPatients && parseInt(maxNewPatients) <= 0) {
        errors.push("Max new patients must be a positive number");
      }

      if (maxFollowUps && parseInt(maxFollowUps) <= 0) {
        errors.push("Max follow ups must be a positive number");
      }

      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Appointment Types Offered Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Appointment Types Offered</h2>
          </div>
          <CardDescription className="mb-6">
            Configure the types of appointments available for booking
          </CardDescription>

          {/* Appointment Type Toggles */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-patient-enabled" className="text-gray-900">New Patient Appointments</Label>
              <IOSSwitch
                id="new-patient-enabled"
                checked={newPatientEnabled}
                onCheckedChange={setNewPatientEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="follow-up-enabled" className="text-gray-900">Follow-up Appointments</Label>
              <IOSSwitch
                id="follow-up-enabled"
                checked={followUpEnabled}
                onCheckedChange={setFollowUpEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="procedure-enabled" className="text-gray-900">Procedure-Specific Appointments</Label>
              <IOSSwitch
                id="procedure-enabled"
                checked={procedureEnabled}
                onCheckedChange={setProcedureEnabled}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Row 1: New Patient and Follow-up Appointments */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="new-patient-duration">New Patient Appointments</Label>
                <Select value={newPatientDuration} onValueChange={setNewPatientDuration}>
                  <SelectTrigger className="h-11">
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
                <Label htmlFor="follow-up-duration">Follow up Appointments</Label>
                <Select value={followUpDuration} onValueChange={setFollowUpDuration}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Procedure-Specific and Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="procedure-specific">Procedure-Specific</Label>
                <Input
                  id="procedure-specific"
                  placeholder="Enter procedure type"
                  value={procedureSpecific}
                  onChange={(e) => setProcedureSpecific(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="procedure-duration">Duration</Label>
                <Select value={procedureDuration} onValueChange={setProcedureDuration}>
                  <SelectTrigger className="h-11">
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

      {/* Appointment Capacity Rules Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Appointment Capacity Rules</h2>
          </div>
          <CardDescription className="mb-6">
            Set limits on appointment bookings
          </CardDescription>

          <div className="space-y-4">
            {/* Max New Patients and Max Follow-ups */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="max-new-patients">Max New Patients per day</Label>
                <Input
                  id="max-new-patients"
                  type="number"
                  placeholder="10"
                  value={maxNewPatients}
                  onChange={(e) => setMaxNewPatients(e.target.value)}
                  className="h-11"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-follow-ups">Max follow ups per day</Label>
                <Input
                  id="max-follow-ups"
                  type="number"
                  placeholder="20"
                  value={maxFollowUps}
                  onChange={(e) => setMaxFollowUps(e.target.value)}
                  className="h-11"
                  min="1"
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
