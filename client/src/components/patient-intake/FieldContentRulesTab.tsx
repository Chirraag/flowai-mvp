import React, { useImperativeHandle, forwardRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Shield, FileCheck } from "lucide-react";

/**
 * FieldContentRulesTab
 * - Field requirements and special instructions configuration
 * - Mirrors the launchpad tab styling and structure
 */
export type FieldContentRulesTabHandle = {
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
  validate: () => { valid: boolean; errors: string[] };
};

export interface FieldContentRulesTabProps {
  initialData?: {
    fieldRequirements: Record<string, string>;
    specialInstructions: Record<string, string>;
  };
}

const FieldContentRulesTab = forwardRef<FieldContentRulesTabHandle, FieldContentRulesTabProps>(({ initialData }, ref) => {
  // Field Requirements state (default values, overridden by initialData if provided)
  const [patientName, setPatientName] = React.useState("required");
  const [dateOfBirth, setDateOfBirth] = React.useState("required");
  const [phoneNumber, setPhoneNumber] = React.useState("required");
  const [email, setEmail] = React.useState("optional");
  const [insuranceId, setInsuranceId] = React.useState("optional");
  const [emergencyContact, setEmergencyContact] = React.useState("required");
  const [preferredLanguage, setPreferredLanguage] = React.useState("optional");

  // Special Instructions state
  const [menoresInstructions, setMenoresInstructions] = React.useState("");
  const [noInsuranceInstructions, setNoInsuranceInstructions] = React.useState("");
  const [languageBarrierInstructions, setLanguageBarrierInstructions] = React.useState("");

  // Populate state from initialData if provided
  React.useEffect(() => {
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
    }
  }, [initialData]);

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
    validate: () => ({ valid: true, errors: [] }),
  }));

  return (
    <div className="space-y-6">
      {/* Required vs Optional Fields Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Required vs Optional Fields</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure field requirements for intake forms</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="patient-name" className="text-gray-900">Patient Name</Label>
              <Select value={patientName} onValueChange={setPatientName}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="date-of-birth" className="text-gray-900">Date of Birth</Label>
              <Select value={dateOfBirth} onValueChange={setDateOfBirth}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="phone-number" className="text-gray-900">Phone Number</Label>
              <Select value={phoneNumber} onValueChange={setPhoneNumber}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-gray-900">Email</Label>
              <Select value={email} onValueChange={setEmail}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="insurance-id" className="text-gray-900">Insurance ID</Label>
              <Select value={insuranceId} onValueChange={setInsuranceId}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="emergency-contact" className="text-gray-900">Emergency Contact</Label>
              <Select value={emergencyContact} onValueChange={setEmergencyContact}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="preferred-language" className="text-gray-900">Preferred Language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger className="w-32 h-9">
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

      {/* Special Instructions & Edge Cases Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Special Instructions & Edge Cases</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure special intake handling</p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="menores-instructions">Minores (Under 18) Instructions</Label>
              <Textarea
                id="menores-instructions"
                placeholder="Enter special instructions for patients under 18..."
                value={menoresInstructions}
                onChange={(e) => setMenoresInstructions(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="no-insurance-instructions">No Insurance Instructions</Label>
              <Textarea
                id="no-insurance-instructions"
                placeholder="Enter instructions for patients without insurance..."
                value={noInsuranceInstructions}
                onChange={(e) => setNoInsuranceInstructions(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language-barrier-instructions">Language Barrier Instructions</Label>
              <Textarea
                id="language-barrier-instructions"
                placeholder="Enter instructions for handling language barriers..."
                value={languageBarrierInstructions}
                onChange={(e) => setLanguageBarrierInstructions(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default FieldContentRulesTab;
