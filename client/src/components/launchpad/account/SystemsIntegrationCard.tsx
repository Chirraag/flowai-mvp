import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SchedulingNumbersMode } from "@/components/launchpad/types";

interface SystemsIntegrationCardProps {
  emrSystems: string[];
  telephonySystems: string[];
  schedulingNumbersMode: SchedulingNumbersMode;
  schedulingPhoneNumbers: string[];
  insuranceVerificationSystem: string;
  insuranceVerificationDetails: string;
  additionalInfo: string;
  clinicalNotes: string;
  onAddEmrSystem: () => void;
  onUpdateEmrSystem: (index: number, value: string) => void;
  onRemoveEmrSystem: (index: number) => void;
  onAddTelephonySystem: () => void;
  onUpdateTelephonySystem: (index: number, value: string) => void;
  onRemoveTelephonySystem: (index: number) => void;
  onChangeSchedulingMode: (mode: SchedulingNumbersMode) => void;
  onAddSchedulingPhone: () => void;
  onUpdateSchedulingPhone: (index: number, value: string) => void;
  onRemoveSchedulingPhone: (index: number) => void;
  onChangeField: (
    field: "insuranceVerificationSystem" | "insuranceVerificationDetails" | "additionalInfo" | "clinicalNotes",
    value: string
  ) => void;
  readOnly?: boolean;
}

export default function SystemsIntegrationCard({
  emrSystems,
  telephonySystems,
  schedulingNumbersMode,
  schedulingPhoneNumbers,
  insuranceVerificationSystem,
  insuranceVerificationDetails,
  additionalInfo,
  clinicalNotes,
  onAddEmrSystem,
  onUpdateEmrSystem,
  onRemoveEmrSystem,
  onAddTelephonySystem,
  onUpdateTelephonySystem,
  onRemoveTelephonySystem,
  onChangeSchedulingMode,
  onAddSchedulingPhone,
  onUpdateSchedulingPhone,
  onRemoveSchedulingPhone,
  onChangeField,
  readOnly = false,
}: SystemsIntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Systems Integration</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-md">EMR/RIS Systems</Label>
            {!readOnly && (
              <Button variant="default" size="sm" onClick={onAddEmrSystem} className="bg-[#f48024] hover:bg-[#f48024]/90 text-white">Add System</Button>
            )}
          </div>
          <div className="space-y-2">
            {emrSystems.map((system, index) => (
              <Input
                key={index}
                placeholder="System name (e.g., Epic, Cerner)"
                value={system}
                onChange={readOnly ? undefined : (e) => onUpdateEmrSystem(index, e.target.value)}
                readOnly={readOnly}
              />
            ))}
            {emrSystems.length === 0 && (
              <p className="text-sm text-muted-foreground">No systems added yet.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-md">Telephony/CCAS Systems</Label>
            {!readOnly && (
              <Button variant="default" size="sm" onClick={onAddTelephonySystem} className="bg-[#f48024] hover:bg-[#f48024]/90 text-white">Add System</Button>
            )}
          </div>
          <div className="space-y-2">
            {telephonySystems.map((system, index) => (
              <Input
                key={index}
                placeholder="System name (e.g., RingCentral, Five9)"
                value={system}
                onChange={readOnly ? undefined : (e) => onUpdateTelephonySystem(index, e.target.value)}
                readOnly={readOnly}
              />
            ))}
            {telephonySystems.length === 0 && (
              <p className="text-sm text-muted-foreground">No systems added yet.</p>
            )}
          </div>
        </div>

        <div>
          <Label className="text-md font-medium">Scheduling Phone Numbers</Label>
          <div className="mt-2 space-y-2">
            {!readOnly && (
              <div>
                <Label className="text-sm">Mode</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="scheduling-single"
                      name="scheduling-mode"
                      checked={schedulingNumbersMode === "Single"}
                      onChange={() => onChangeSchedulingMode("Single")}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="scheduling-single" className="text-sm">Single</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="scheduling-multiple"
                      name="scheduling-mode"
                      checked={schedulingNumbersMode === "Multiple"}
                      onChange={() => onChangeSchedulingMode("Multiple")}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="scheduling-multiple" className="text-sm">Multiple</Label>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Phone Numbers</Label>
                {!readOnly && (
                  <Button variant="default" size="sm" onClick={onAddSchedulingPhone} className="bg-[#f48024] hover:bg-[#f48024]/90 text-white">Add Number</Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {schedulingPhoneNumbers.map((num, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                    <Input
                      placeholder="Phone number"
                      value={num}
                      onChange={readOnly ? undefined : (e) => onUpdateSchedulingPhone(index, e.target.value)}
                      readOnly={readOnly}
                      className="border-none bg-transparent p-0 h-auto text-sm"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                        onClick={() => onRemoveSchedulingPhone(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {schedulingPhoneNumbers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No phone numbers added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Insurance Verification System</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            placeholder="System name or process"
            value={insuranceVerificationSystem}
            onChange={readOnly ? undefined : (e) => onChangeField("insuranceVerificationSystem", e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Insurance Verification Details</Label>
          <Textarea
            className="mt-2 min-h-32 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            placeholder="Describe the verification process or system details"
            value={insuranceVerificationDetails}
            onChange={readOnly ? undefined : (e) => onChangeField("insuranceVerificationDetails", e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Additional Information</Label>
          <Textarea
            className="mt-2 min-h-32 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            placeholder="Any additional integration details..."
            value={additionalInfo}
            onChange={readOnly ? undefined : (e) => onChangeField("additionalInfo", e.target.value)}
            readOnly={readOnly}
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Clinical Notes</Label>
          <Textarea
            className="mt-2 min-h-32 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            placeholder="Clinical notes relevant to systems"
            value={clinicalNotes}
            onChange={readOnly ? undefined : (e) => onChangeField("clinicalNotes", e.target.value)}
            readOnly={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
}


