import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck } from "lucide-react";
import { usePermissions } from "@/context/AuthContext";

/**
 * FieldContentRulesTab
 * - Field requirements and special instructions configuration
 * - Enhanced with brand styling and sophisticated save system
 * - Controlled component: receives values and onChange handler
 */
export type FieldContentRulesTabProps = {
  values: {
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
  onChange: (values: FieldContentRulesTabProps['values']) => void;
  readOnly?: boolean;
};

const FieldContentRulesTab = ({ values, onChange, readOnly: readOnlyProp }: FieldContentRulesTabProps) => {
  const { canEditPatientIntakeAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditPatientIntakeAgent;


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
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="patient-name" className="text-[#1c275e] font-medium">Patient Name</Label>
              <Select value={values.fieldRequirements.patientName} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    patientName: value
                  }
                });

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
              <Select value={values.fieldRequirements.dateOfBirth} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    dateOfBirth: value
                  }
                });

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
              <Select value={values.fieldRequirements.phoneNumber} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    phoneNumber: value
                  }
                });

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
              <Select value={values.fieldRequirements.email} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    email: value
                  }
                });

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
              <Select value={values.fieldRequirements.insuranceId} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    insuranceId: value
                  }
                });

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
              <Select value={values.fieldRequirements.emergencyContact} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    emergencyContact: value
                  }
                });

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
              <Select value={values.fieldRequirements.preferredLanguage} onValueChange={readOnly ? undefined : (value) => {
                onChange({
                  ...values,
                  fieldRequirements: {
                    ...values.fieldRequirements,
                    preferredLanguage: value
                  }
                });

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
                value={values.specialInstructions.menoresInstructions}
                onChange={readOnly ? undefined : (e) => {
                  onChange({
                    ...values,
                    specialInstructions: {
                      ...values.specialInstructions,
                      menoresInstructions: e.target.value
                    }
                  });

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
                value={values.specialInstructions.noInsuranceInstructions}
                onChange={readOnly ? undefined : (e) => {
                  onChange({
                    ...values,
                    specialInstructions: {
                      ...values.specialInstructions,
                      noInsuranceInstructions: e.target.value
                    }
                  });

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
                value={values.specialInstructions.languageBarrierInstructions}
                onChange={readOnly ? undefined : (e) => {
                  onChange({
                    ...values,
                    specialInstructions: {
                      ...values.specialInstructions,
                      languageBarrierInstructions: e.target.value
                    }
                  });

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
};

export default FieldContentRulesTab;
