import React, { useImperativeHandle, forwardRef, useEffect } from "react";
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
 */
export type PatientEligibilityTabProps = {
  initialValues?: PatientEligibilityValues;
  onSave?: (values: PatientEligibilityValues) => Promise<void>;
  isSaving?: boolean;
  readOnly?: boolean;
};

export type PatientEligibilityTabHandle = {
  /**
   * Returns the current values held by the tab.
   */
  getValues: () => PatientEligibilityValues;
  /**
   * Lightweight validation for the tab.
   */
  validate: () => { valid: boolean; errors: string[] };
};

const PatientEligibilityTab = forwardRef<PatientEligibilityTabHandle, PatientEligibilityTabProps>(({ initialValues, onSave, isSaving = false, readOnly: readOnlyProp }, ref) => {
  const { canEditSchedulingAgent } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSchedulingAgent;
  // Patient Types state
  const [newPatients, setNewPatients] = React.useState(false);
  const [existingPatients, setExistingPatients] = React.useState(false);
  const [selfPay, setSelfPay] = React.useState(false);
  const [hmo, setHmo] = React.useState(false);
  const [ppo, setPpo] = React.useState(false);
  const [medicare, setMedicare] = React.useState(false);
  const [medicaid, setMedicaid] = React.useState(false);

  // Referral Requirements state (arrays for individual input fields)
  const [servicesRequiringReferrals, setServicesRequiringReferrals] = React.useState<string[]>([]);
  const [insurancePlansRequiringReferrals, setInsurancePlansRequiringReferrals] = React.useState<string[]>([]);

  // Set initial values when props change
  useEffect(() => {
    if (initialValues) {
      setNewPatients(initialValues.patientTypes.newPatients);
      setExistingPatients(initialValues.patientTypes.existingPatients);
      setSelfPay(initialValues.patientTypes.selfPay);
      setHmo(initialValues.patientTypes.hmo);
      setPpo(initialValues.patientTypes.ppo);
      setMedicare(initialValues.patientTypes.medicare);
      setMedicaid(initialValues.patientTypes.medicaid);

      // Convert textarea strings to arrays for individual input fields
      setServicesRequiringReferrals(
        initialValues.referralRequirements.servicesRequiringReferrals
          ? initialValues.referralRequirements.servicesRequiringReferrals.split('\n').filter(line => line.trim())
          : []
      );
      setInsurancePlansRequiringReferrals(
        initialValues.referralRequirements.insurancePlansRequiringReferrals
          ? initialValues.referralRequirements.insurancePlansRequiringReferrals.split('\n').filter(line => line.trim())
          : []
      );
    }
  }, [initialValues]);

  // Referral management handlers
  const handleAddService = () => {
    setServicesRequiringReferrals([...servicesRequiringReferrals, ""]);
  };

  const handleAddInsurancePlan = () => {
    setInsurancePlansRequiringReferrals([...insurancePlansRequiringReferrals, ""]);
  };

  const handleUpdateService = (index: number, value: string) => {
    const updated = [...servicesRequiringReferrals];
    updated[index] = value;
    setServicesRequiringReferrals(updated);
  };

  const handleUpdateInsurancePlan = (index: number, value: string) => {
    const updated = [...insurancePlansRequiringReferrals];
    updated[index] = value;
    setInsurancePlansRequiringReferrals(updated);
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
      const updated = servicesRequiringReferrals.filter((_, i) => i !== deleteDialog.index);
      setServicesRequiringReferrals(updated);
    } else if (deleteDialog.type === 'insurance' && deleteDialog.index !== undefined) {
      const updated = insurancePlansRequiringReferrals.filter((_, i) => i !== deleteDialog.index);
      setInsurancePlansRequiringReferrals(updated);
    }
    setDeleteDialog({ open: false });
  };

  // Save handler
  const handleSave = async () => {
    if (!onSave) return;

    const currentRef = (ref as React.MutableRefObject<PatientEligibilityTabHandle | null>).current;
    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
    }
  };

  // Expose values and validation to parent page
  useImperativeHandle(ref, () => ({
    getValues: () => ({
      patientTypes: {
        newPatients,
        existingPatients,
        selfPay,
        hmo,
        ppo,
        medicare,
        medicaid,
      },
      referralRequirements: {
        // Convert arrays back to newline-separated strings for API compatibility
        servicesRequiringReferrals: servicesRequiringReferrals.filter(item => item.trim()).join('\n'),
        insurancePlansRequiringReferrals: insurancePlansRequiringReferrals.filter(item => item.trim()).join('\n'),
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
                checked={newPatients}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setNewPatients(checked);
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
                checked={existingPatients}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setExistingPatients(checked);
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
                checked={selfPay}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setSelfPay(checked);
                    
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
                checked={hmo}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setHmo(checked);
                    
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
                checked={ppo}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setPpo(checked);
                    
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
                checked={medicare}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setMedicare(checked);
                    
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
                checked={medicaid}
                onCheckedChange={(checked) => {
                  if (!readOnly) {
                    setMedicaid(checked);
                    
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
                {servicesRequiringReferrals.map((service, index) => (
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
                {servicesRequiringReferrals.length === 0 && (
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
                {insurancePlansRequiringReferrals.map((plan, index) => (
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
                {insurancePlansRequiringReferrals.length === 0 && (
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
});

export default PatientEligibilityTab;
