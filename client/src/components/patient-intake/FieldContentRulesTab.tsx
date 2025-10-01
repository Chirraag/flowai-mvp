import React, { useImperativeHandle, forwardRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck, Save, Loader2 } from "lucide-react";
import { usePermissions } from "@/context/AuthContext";

/**
 * FieldContentRulesTab
 * - Field requirements and special instructions configuration
 * - Enhanced with brand styling and sophisticated save system
 */
export type FieldContentRulesTabProps = {
  initialData?: {
    fieldRequirements: Record<string, string>;
    specialInstructions: Record<string, string>;
  };
  onSave?: (values: any) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

export type FieldContentRulesTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => {
    fieldRequirements: {
      patientName: string;
      dateOfBirth: string;
      phoneNumber: string;
      email: string;
      insuranceId: string;
      emergencyContact: string;
      preferredLanguage: string;
    };
    specialInstructions: {
      menoresInstructions: string;
      noInsuranceInstructions: string;
      languageBarrierInstructions: string;
    };
  };
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const FieldContentRulesTab = forwardRef<FieldContentRulesTabHandle, FieldContentRulesTabProps>(({ initialData, onSave, isSaving = false, readOnly: readOnlyProp }, ref) => {
  const { canEditPatientIntakeAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditPatientIntakeAgent;
  // Field Requirements state (default values, overridden by initialData if provided)
  const [patientName, setPatientName] = useState("required");
  const [dateOfBirth, setDateOfBirth] = useState("required");
  const [phoneNumber, setPhoneNumber] = useState("required");
  const [email, setEmail] = useState("optional");
  const [insuranceId, setInsuranceId] = useState("optional");
  const [emergencyContact, setEmergencyContact] = useState("required");
  const [preferredLanguage, setPreferredLanguage] = useState("optional");

  // Special Instructions state
  const [menoresInstructions, setMenoresInstructions] = useState("");
  const [noInsuranceInstructions, setNoInsuranceInstructions] = useState("");
  const [languageBarrierInstructions, setLanguageBarrierInstructions] = useState("");

  // Change tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Populate state from initialData if provided
  useEffect(() => {
    if (initialData) {
      setPatientName(initialData.fieldRequirements.patientName || "required");
      setDateOfBirth(initialData.fieldRequirements.dateOfBirth || "required");
      setPhoneNumber(initialData.fieldRequirements.phoneNumber || "required");
      setEmail(initialData.fieldRequirements.email || "optional");
      setInsuranceId(initialData.fieldRequirements.insuranceId || "optional");
      setEmergencyContact(initialData.fieldRequirements.emergencyContact || "required");
      setPreferredLanguage(initialData.fieldRequirements.preferredLanguage || "optional");

      setMenoresInstructions(initialData.specialInstructions.menoresInstructions || "");
      setNoInsuranceInstructions(initialData.specialInstructions.noInsuranceInstructions || "");
      setLanguageBarrierInstructions(initialData.specialInstructions.languageBarrierInstructions || "");
      setHasUnsavedChanges(false);
    }
  }, [initialData]);

  // Track changes
  const handleFieldChange = () => {
    setHasUnsavedChanges(true);
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<FieldContentRulesTabHandle | null>).current;
    const validation = currentRef?.validate();
    if (validation && !validation.valid) {
      // Validation errors will be handled by the parent
      return;
    }

    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
    }
  };

  useImperativeHandle(ref, () => ({
    getValues: () => ({
      fieldRequirements: {
        patientName,
        dateOfBirth,
        phoneNumber,
        email,
        insuranceId,
        emergencyContact,
        preferredLanguage,
      },
      specialInstructions: {
        menoresInstructions,
        noInsuranceInstructions,
        languageBarrierInstructions,
      },
    }),
    validate: () => {
      const errors: string[] = [];
      // Basic validation can be added here if needed
      return { valid: errors.length === 0, errors };
    },
  }));

  return (
    <div className="space-y-6">
      {/* Enhanced Required vs Optional Fields Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Required vs Optional Fields</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure field requirements for intake forms</p>
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
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="patient-name" className="text-[#1c275e] font-medium">Patient Name</Label>
              <Select value={patientName} onValueChange={readOnly ? undefined : (value) => {
                setPatientName(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="date-of-birth" className="text-[#1c275e] font-medium">Date of Birth</Label>
              <Select value={dateOfBirth} onValueChange={readOnly ? undefined : (value) => {
                setDateOfBirth(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="phone-number" className="text-[#1c275e] font-medium">Phone Number</Label>
              <Select value={phoneNumber} onValueChange={readOnly ? undefined : (value) => {
                setPhoneNumber(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="email" className="text-[#1c275e] font-medium">Email</Label>
              <Select value={email} onValueChange={readOnly ? undefined : (value) => {
                setEmail(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="insurance-id" className="text-[#1c275e] font-medium">Insurance ID</Label>
              <Select value={insuranceId} onValueChange={readOnly ? undefined : (value) => {
                setInsuranceId(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="emergency-contact" className="text-[#1c275e] font-medium">Emergency Contact</Label>
              <Select value={emergencyContact} onValueChange={readOnly ? undefined : (value) => {
                setEmergencyContact(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="preferred-language" className="text-[#1c275e] font-medium">Preferred Language</Label>
              <Select value={preferredLanguage} onValueChange={readOnly ? undefined : (value) => {
                setPreferredLanguage(value);
                handleFieldChange();
              }} disabled={readOnly}>
                <SelectTrigger className="w-32 h-11 border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Special Instructions & Edge Cases Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Special Instructions & Edge Cases</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Configure special intake handling</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="menores-instructions" className="text-sm font-semibold text-[#1c275e]">Minors (Under 18) Instructions</Label>
              <Textarea
                id="menores-instructions"
                placeholder="Enter special instructions for patients under 18..."
                value={menoresInstructions}
                onChange={readOnly ? undefined : (e) => {
                  setMenoresInstructions(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="min-h-24 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no-insurance-instructions" className="text-sm font-semibold text-[#1c275e]">No Insurance Instructions</Label>
              <Textarea
                id="no-insurance-instructions"
                placeholder="Enter instructions for patients without insurance..."
                value={noInsuranceInstructions}
                onChange={readOnly ? undefined : (e) => {
                  setNoInsuranceInstructions(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="min-h-24 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-barrier-instructions" className="text-sm font-semibold text-[#1c275e]">Language Barrier Instructions</Label>
              <Textarea
                id="language-barrier-instructions"
                placeholder="Enter instructions for handling language barriers..."
                value={languageBarrierInstructions}
                onChange={readOnly ? undefined : (e) => {
                  setLanguageBarrierInstructions(e.target.value);
                  handleFieldChange();
                }}
                readOnly={readOnly}
                className="min-h-24 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default FieldContentRulesTab;
