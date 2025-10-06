import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/form-error";
import { SectionErrorSummary } from "@/components/ui/validation-components";
import { usePermissions } from "@/context/AuthContext";
import type { ValidationError } from "@/lib/launchpad.utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SystemsIntegrationCardProps {
  emrSystems: string[];
  telephonySystems: string[];
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
  onAddSchedulingPhone: () => void;
  onUpdateSchedulingPhone: (index: number, value: string) => void;
  onRemoveSchedulingPhone: (index: number) => void;
  onChangeField: (
    field: "insuranceVerificationSystem" | "insuranceVerificationDetails" | "additionalInfo" | "clinicalNotes",
    value: string
  ) => void;
  errors?: Record<string, string>;
  formErrors?: ValidationError[];
  formWarnings?: ValidationError[];
  onValidateField?: (fieldName: string, value: string, section: string) => void;
  readOnly?: boolean;
}

export default function SystemsIntegrationCard({
  emrSystems,
  telephonySystems,
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
  onAddSchedulingPhone,
  onUpdateSchedulingPhone,
  onRemoveSchedulingPhone,
  onChangeField,
  errors = {},
  formErrors = [],
  formWarnings = [],
  onValidateField,
  readOnly: readOnlyProp,
}: SystemsIntegrationCardProps) {
  const { canEditAccountDetails } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditAccountDetails;
  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    phoneIndex?: number;
    phoneNumber?: string;
  }>({ open: false });

  // Phone number formatting for display
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits maximum
    const limitedDigits = digits.slice(0, 10);

    // Apply US phone format: XXX-XXX-XXXX
    if (limitedDigits.length <= 3) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
    } else {
      return `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  const handlePhoneChange = (index: number, rawValue: string) => {
    // Format for display, but store only digits (no hyphens)
    const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 10);
    onUpdateSchedulingPhone(index, digitsOnly);

    // Trigger real-time validation if available
    onValidateField?.(`scheduling-phone-${index}`, digitsOnly, 'systems-integration');
  };

  // Deletion confirmation handlers
  const handleDeletePhone = (index: number, phoneNumber: string) => {
    setDeleteDialog({
      open: true,
      phoneIndex: index,
      phoneNumber
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.phoneIndex !== undefined) {
      onRemoveSchedulingPhone(deleteDialog.phoneIndex);
      setDeleteDialog({ open: false });
    }
  };

  return (
    <div className="space-y-6">
      <SectionErrorSummary
        errors={formErrors}
        warnings={formWarnings}
        sectionName="systems-integration"
      />
        {/* EMR Systems Section */}
        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#1C275E]/10 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <Label className="text-base font-medium text-[#1C275E]">EMR/RIS Systems</Label>
              </div>
              {!readOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAddEmrSystem}
                  className="bg-[#F48024] hover:bg-[#F48024]/90 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add System
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {emrSystems.map((system, index) => (
                <Input
                  key={index}
                  className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="System name (e.g., Epic, Cerner)"
                  value={system}
                  onChange={readOnly ? undefined : (e) => onUpdateEmrSystem(index, e.target.value)}
                  readOnly={readOnly}
                />
              ))}
              {emrSystems.length === 0 && (
                <div className="text-center py-8 px-4 bg-white rounded-lg border-2 border-dashed border-[#1C275E]/20">
                  <div className="w-12 h-12 bg-[#1C275E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-[#1C275E]/70">No EMR systems added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Telephony Systems Section */}
        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#1C275E]/10 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <Label className="text-base font-medium text-[#1C275E]">Telephony/CCAS Systems</Label>
              </div>
              {!readOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAddTelephonySystem}
                  className="bg-[#F48024] hover:bg-[#F48024]/90 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add System
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {telephonySystems.map((system, index) => (
                <Input
                  key={index}
                  className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="System name (e.g., RingCentral, Five9)"
                  value={system}
                  onChange={readOnly ? undefined : (e) => onUpdateTelephonySystem(index, e.target.value)}
                  readOnly={readOnly}
                />
              ))}
              {telephonySystems.length === 0 && (
                <div className="text-center py-8 px-4 bg-white rounded-lg border-2 border-dashed border-[#1C275E]/20">
                  <div className="w-12 h-12 bg-[#1C275E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-[#1C275E]/70">No telephony systems added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phone Numbers Section */}
        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#1C275E]/10 rounded-md flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <Label className="text-base font-medium text-[#1C275E]">Scheduling Phone Numbers</Label>
              </div>
              {!readOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAddSchedulingPhone}
                  className="bg-[#F48024] hover:bg-[#F48024]/90 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Number
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schedulingPhoneNumbers.map((num, index) => (
                <div key={index} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Input
                        className="border-none bg-transparent p-0 h-auto text-sm font-medium text-[#1C275E] focus:ring-0"
                        placeholder="123-456-7890"
                        value={formatPhoneNumber(num)}
                        onChange={readOnly ? undefined : (e) => handlePhoneChange(index, e.target.value)}
                        readOnly={readOnly}
                      />
                      <FieldError error={errors[`scheduling-phone-${index}`]} />
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full ml-2"
                        onClick={() => handleDeletePhone(index, num)}
                        aria-label="Delete phone number"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {schedulingPhoneNumbers.length === 0 && (
                <div className="text-center py-8 px-4 bg-white rounded-lg border-2 border-dashed border-[#1C275E]/20">
                  <div className="w-12 h-12 bg-[#1C275E]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-[#1C275E]/70">No phone numbers added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-[#1C275E]/10 rounded-md flex items-center justify-center">
                <svg className="w-3 h-3 text-[#1C275E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <Label className="text-base font-medium text-[#1C275E]">Additional Details</Label>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-[#1C275E]">Insurance Verification System</Label>
                <Input
                  className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="System name or process"
                  value={insuranceVerificationSystem}
                  onChange={readOnly ? undefined : (e) => onChangeField("insuranceVerificationSystem", e.target.value)}
                  readOnly={readOnly}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-[#1C275E]">Insurance Verification Details</Label>
                <Textarea
                  className="mt-2 min-h-24 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="Describe the verification process or system details"
                  value={insuranceVerificationDetails}
                  onChange={readOnly ? undefined : (e) => onChangeField("insuranceVerificationDetails", e.target.value)}
                  readOnly={readOnly}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-[#1C275E]">Additional Information</Label>
                <Textarea
                  className="mt-2 min-h-24 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="Any additional integration details..."
                  value={additionalInfo}
                  onChange={readOnly ? undefined : (e) => onChangeField("additionalInfo", e.target.value)}
                  readOnly={readOnly}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-[#1C275E]">Clinical Notes</Label>
                <Textarea
                  className="mt-2 min-h-24 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                  placeholder="Clinical notes relevant to systems"
                  value={clinicalNotes}
                  onChange={readOnly ? undefined : (e) => onChangeField("clinicalNotes", e.target.value)}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        </div>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Phone Number</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the phone number "{deleteDialog.phoneNumber}"?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


