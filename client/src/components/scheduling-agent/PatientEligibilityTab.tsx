import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Users, FileText, User, CreditCard, Shield, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/context/AuthContext";
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
import type { PatientEligibilityValues } from "@/types/schedulingAgent";

/**
 * PatientEligibilityTab
 * - Patient types and referral requirements configuration
 * - Mirrors the launchpad tab styling and structure
 * - Controlled component: receives values and onChange handler
 */
export type PatientEligibilityTabProps = {
  values: PatientEligibilityValues;
  onChange: (values: PatientEligibilityValues) => void;
  onSave?: () => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

const PatientEligibilityTab = ({ values, onChange, onSave, isSaving = false, readOnly: readOnlyProp }: PatientEligibilityTabProps) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;

  // Helper functions for working with referral requirements
  const servicesArray = values.referralRequirements.servicesRequiringReferrals
    ? values.referralRequirements.servicesRequiringReferrals.split('\n')
    : [];
  const insurancePlansArray = values.referralRequirements.insurancePlansRequiringReferrals
    ? values.referralRequirements.insurancePlansRequiringReferrals.split('\n')
    : [];

  // Referral management handlers
  const handleAddService = () => {
    const newServices = [...servicesArray, ""];
    onChange({
      ...values,
      referralRequirements: {
        ...values.referralRequirements,
        servicesRequiringReferrals: newServices.join('\n')
      }
    });
  };

  const handleAddInsurancePlan = () => {
    const newPlans = [...insurancePlansArray, ""];
    onChange({
      ...values,
      referralRequirements: {
        ...values.referralRequirements,
        insurancePlansRequiringReferrals: newPlans.join('\n')
      }
    });
  };

  const handleUpdateService = (index: number, value: string) => {
    const updated = [...servicesArray];
    updated[index] = value;
    onChange({
      ...values,
      referralRequirements: {
        ...values.referralRequirements,
        servicesRequiringReferrals: updated.join('\n')
      }
    });
  };

  const handleUpdateInsurancePlan = (index: number, value: string) => {
    const updated = [...insurancePlansArray];
    updated[index] = value;
    onChange({
      ...values,
      referralRequirements: {
        ...values.referralRequirements,
        insurancePlansRequiringReferrals: updated.join('\n')
      }
    });
  };

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    type?: 'service' | 'insurance';
    index?: number;
    name?: string;
  }>({ open: false });

  // Delete handlers
  const handleDeleteService = (index: number, serviceName: string) => {
    setDeleteDialog({
      open: true,
      type: 'service',
      index,
      name: serviceName
    });
  };

  const handleDeleteInsurancePlan = (index: number, planName: string) => {
    setDeleteDialog({
      open: true,
      type: 'insurance',
      index,
      name: planName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'service' && deleteDialog.index !== undefined) {
      const updated = servicesArray.filter((_, i) => i !== deleteDialog.index);
      onChange({
        ...values,
        referralRequirements: {
          ...values.referralRequirements,
          servicesRequiringReferrals: updated.join('\n')
        }
      });
    } else if (deleteDialog.type === 'insurance' && deleteDialog.index !== undefined) {
      const updated = insurancePlansArray.filter((_, i) => i !== deleteDialog.index);
      onChange({
        ...values,
        referralRequirements: {
          ...values.referralRequirements,
          insurancePlansRequiringReferrals: updated.join('\n')
        }
      });
    }
    setDeleteDialog({ open: false });
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;
    await onSave();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Patient Types Accepted Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#1c275e] to-[#2a3570] text-white p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-[#f48024]" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">Patient Types Accepted</CardTitle>
                <p className="text-gray-200 text-sm mt-1">Configure which patient types can be scheduled</p>
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

          {/* Enhanced Patient Type Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="new-patients" className="text-[#1c275e] font-medium">New Patients</Label>
              </div>
              <IOSSwitch
                id="new-patients"
                checked={values.patientTypes.newPatients}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        newPatients: checked
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
                <Label htmlFor="existing-patients" className="text-[#1c275e] font-medium">Existing Patients</Label>
              </div>
              <IOSSwitch
                id="existing-patients"
                checked={values.patientTypes.existingPatients}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        existingPatients: checked
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
                  <CreditCard className="h-4 w-4 text-[#2a3570]" />
                </div>
                <Label htmlFor="self-pay" className="text-[#1c275e] font-medium">Self-Pay</Label>
              </div>
              <IOSSwitch
                id="self-pay"
                checked={values.patientTypes.selfPay}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        selfPay: checked
                      }
                    });

                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="hmo" className="text-[#1c275e] font-medium">HMO</Label>
              </div>
              <IOSSwitch
                id="hmo"
                checked={values.patientTypes.hmo}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        hmo: checked
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
                  <Shield className="h-4 w-4 text-[#1c275e]" />
                </div>
                <Label htmlFor="ppo" className="text-[#1c275e] font-medium">PPO</Label>
              </div>
              <IOSSwitch
                id="ppo"
                checked={values.patientTypes.ppo}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        ppo: checked
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
                  <Shield className="h-4 w-4 text-[#2a3570]" />
                </div>
                <Label htmlFor="medicare" className="text-[#1c275e] font-medium">Medicare</Label>
              </div>
              <IOSSwitch
                id="medicare"
                checked={values.patientTypes.medicare}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        medicare: checked
                      }
                    });
                    
                  }
                }}
                disabled={readOnly}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-[#f48024]" />
                </div>
                <Label htmlFor="medicaid" className="text-[#1c275e] font-medium">Medicaid</Label>
              </div>
              <IOSSwitch
                id="medicaid"
                checked={values.patientTypes.medicaid}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    onChange({
                      ...values,
                      patientTypes: {
                        ...values.patientTypes,
                        medicaid: checked
                      }
                    });
                    
                  }
                }}
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Referral Requirements Card */}
      <Card className="border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#2a3570] to-[#1c275e] text-white p-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f48024]/20 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#f48024]" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-white">Referral Requirements</CardTitle>
              <p className="text-gray-200 text-sm mt-1">Configure referral requirements by insurance or service</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">

          {/* Enhanced Referral Requirements Sections */}
          <div className="space-y-6">
            {/* Services Requiring Referrals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold text-[#1c275e]">Services Requiring Referrals</Label>
                {!readOnly && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddService}
                    className="bg-[#f48024] hover:bg-[#f48024]/90 text-white"
                  >
                    Add Service
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {servicesArray.map((service, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                    <Input
                      placeholder="Service name (e.g., MRI)"
                      value={service}
                      onChange={readOnly ? undefined : (e) => handleUpdateService(index, e.target.value)}
                      readOnly={readOnly}
                      className="border-none bg-transparent p-0 h-auto text-sm min-w-[150px]"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteService(index, service)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {servicesArray.length === 0 && (
                  <p className="text-sm text-muted-foreground">No services added yet.</p>
                )}
              </div>
            </div>

            {/* Insurance Plans Requiring Referrals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-semibold text-[#1c275e]">Insurance Plans Requiring Referrals</Label>
                {!readOnly && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleAddInsurancePlan}
                    className="bg-[#f48024] hover:bg-[#f48024]/90 text-white"
                  >
                    Add Plan
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {insurancePlansArray.map((plan, index) => (
                  <div key={index} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                    <Input
                      placeholder="Insurance plan name"
                      value={plan}
                      onChange={readOnly ? undefined : (e) => handleUpdateInsurancePlan(index, e.target.value)}
                      readOnly={readOnly}
                      className="border-none bg-transparent p-0 h-auto text-sm min-w-[150px]"
                    />
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteInsurancePlan(index, plan)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                {insurancePlansArray.length === 0 && (
                  <p className="text-sm text-muted-foreground">No insurance plans added yet.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type === 'service' ? 'Service' : 'Insurance Plan'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"?
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
};

export default PatientEligibilityTab;
