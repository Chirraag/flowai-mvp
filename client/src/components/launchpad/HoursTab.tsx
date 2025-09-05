import React, { useState, useImperativeHandle, useEffect, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, Calendar, Phone, Plus, X } from "lucide-react";

interface HoursTabProps {
  clinicHoursByDay?: Record<string, string>;
  schedulingHoursByDay?: Record<string, string>;
  schedulingHoursDifferent?: boolean;
  holidays?: string[];
  emergencyInstructions?: string;
  afterHoursInstructions?: string;
  locationName?: string;
}

/**
 * HoursTab
 * - Per-day hour fields for clinic and scheduling hours
 * - Toggle to control scheduling hours visibility
 * - Hydrates from props on mount, maintains local state for edits
 */
export type HoursTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
    schedulingHoursDifferent: boolean;
    holidays: string[];
    emergencyInstructions: string;
    afterHoursInstructions: string;
    clinicHours: Record<string, string>;
    schedulingHours: Record<string, string>;
  };
  /**
   * Validates required fields when configuration is saved.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const HoursTab = forwardRef<HoursTabHandle, HoursTabProps>((props, ref) => {
  const [schedulingHoursDifferent, setSchedulingHoursDifferent] = useState(false);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [emergencyInstructions, setEmergencyInstructions] = useState("");
  const [afterHoursInstructions, setAfterHoursInstructions] = useState("");
  const [clinicHours, setClinicHours] = useState<Record<string, string>>({});
  const [schedulingHours, setSchedulingHours] = useState<Record<string, string>>({});

  // Seed local state from props on mount
  useEffect(() => {
    if (props.schedulingHoursDifferent !== undefined) {
      setSchedulingHoursDifferent(props.schedulingHoursDifferent);
    }
    if (props.holidays && props.holidays.length > 0) {
      setHolidays(props.holidays);
    }
    if (props.emergencyInstructions) {
      setEmergencyInstructions(props.emergencyInstructions);
    }
    if (props.afterHoursInstructions) {
      setAfterHoursInstructions(props.afterHoursInstructions);
    }
    if (props.clinicHoursByDay) {
      setClinicHours(props.clinicHoursByDay);
    }
    if (props.schedulingHoursByDay) {
      setSchedulingHours(props.schedulingHoursByDay);
    }
  }, [
    props.schedulingHoursDifferent,
    props.holidays,
    props.emergencyInstructions,
    props.afterHoursInstructions,
    props.clinicHoursByDay,
    props.schedulingHoursByDay,
  ]);

  const addHoliday = () => {
    setHolidays(prev => [...prev, ""]);
  };

  const updateHoliday = (index: number, value: string) => {
    setHolidays(prev => prev.map((holiday, i) => i === index ? value : holiday));
  };

  const removeHoliday = (index: number) => {
    setHolidays(prev => prev.filter((_, i) => i !== index));
  };

  const updateClinicHour = (day: string, value: string) => {
    setClinicHours(prev => ({ ...prev, [day]: value }));
  };

  const updateSchedulingHour = (day: string, value: string) => {
    setSchedulingHours(prev => ({ ...prev, [day]: value }));
  };

  // Validation: check required fields
  const validate = () => {
    const errors: string[] = [];

    // Check if any holiday dates are empty
    holidays.forEach((holiday, index) => {
      if (holiday.trim() === "") {
        errors.push(`Holiday ${index + 1}: Date is required`);
      }
    });

    // Emergency instructions are optional but if provided, shouldn't be empty
    if (emergencyInstructions.trim() === "") {
      // Optional field, no error needed
    }

    // After-hours instructions are optional but if provided, shouldn't be empty
    if (afterHoursInstructions.trim() === "") {
      // Optional field, no error needed
    }

    return { valid: errors.length === 0, errors };
  };

  // Expose validation to parent component
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      schedulingHoursDifferent,
      holidays,
      emergencyInstructions,
      afterHoursInstructions,
      clinicHours,
      schedulingHours,
    }),
    validate,
  }));

  return (
    <div className="space-y-6">
      {/* Card 1: Operating Hours */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Operating Hours</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="scheduling-hours"
                checked={schedulingHoursDifferent}
                onCheckedChange={(checked) => setSchedulingHoursDifferent(checked === true)}
              />
              <Label htmlFor="scheduling-hours" className="text-sm text-gray-700">
                Scheduling hours are different from clinic hours
              </Label>
            </div>

            {/* Clinic Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Clinic Hours {props.locationName ? `- ${props.locationName}` : ''}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <Label className="w-20 text-sm font-medium">{day}:</Label>
                    <Input
                      type="text"
                      placeholder="e.g., 8:00 am - 5:00 pm"
                      value={clinicHours[day] || ""}
                      onChange={(e) => updateClinicHour(day, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduling Hours - conditionally shown */}
            {schedulingHoursDifferent && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Scheduling Hours</h3>
                <div className="grid grid-cols-1 gap-3">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center gap-3">
                      <Label className="w-20 text-sm font-medium">{day}:</Label>
                      <Input
                        type="text"
                        placeholder="e.g., 8:30 am - 4:30 pm"
                        value={schedulingHours[day] || ""}
                        onChange={(e) => updateSchedulingHour(day, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Holidays & Closures */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Holidays & Closures</h2>
          </div>

          <div className="space-y-4">
            {/* Add Holiday/Closure button */}
            <Button type="button" className="h-10" onClick={addHoliday}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday/Closure
            </Button>

            {/* Dynamic date input fields */}
            <div className="space-y-3">
              {holidays.map((holiday, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="date"
                    placeholder="Select date"
                    value={holiday}
                    onChange={(e) => updateHoliday(index, e.target.value)}
                    className="h-11 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove holiday ${index + 1}`}
                    onClick={() => removeHoliday(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Emergency & After-Hours Instructions */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Emergency & After-Hours Instructions</h2>
          </div>

          <div className="space-y-6">
            {/* Emergency Instructions */}
            <div className="space-y-2">
              <Label htmlFor="emergency-instructions">Emergency Instructions</Label>
              <Textarea
                id="emergency-instructions"
                placeholder="Enter emergency contact information and procedures..."
                value={emergencyInstructions}
                onChange={(e) => setEmergencyInstructions(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* After-Hours Instructions */}
            <div className="space-y-2">
              <Label htmlFor="after-hours-instructions">After-Hours Instructions</Label>
              <Textarea
                id="after-hours-instructions"
                placeholder="Enter after-hours contact information and procedures..."
                value={afterHoursInstructions}
                onChange={(e) => setAfterHoursInstructions(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default HoursTab;


