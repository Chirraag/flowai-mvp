import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Users, FileText, User, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PatientEligibilityTab = forwardRef<PatientEligibilityTabHandle, PatientEligibilityTabProps>(({ initialValues, onSave, isSaving = false }, ref) => {
  // Patient Types state
  const [newPatients, setNewPatients] = React.useState(true);
  const [existingPatients, setExistingPatients] = React.useState(true);
  const [selfPay, setSelfPay] = React.useState(true);
  const [hmo, setHmo] = React.useState(false);
  const [ppo, setPpo] = React.useState(true);
  const [medicare, setMedicare] = React.useState(true);
  const [medicaid, setMedicaid] = React.useState(false);

  // Referral Requirements state
  const [servicesRequiringReferrals, setServicesRequiringReferrals] = React.useState("");
  const [insurancePlansRequiringReferrals, setInsurancePlansRequiringReferrals] = React.useState("");

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

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
      setServicesRequiringReferrals(initialValues.referralRequirements.servicesRequiringReferrals);
      setInsurancePlansRequiringReferrals(initialValues.referralRequirements.insurancePlansRequiringReferrals);
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

    const currentRef = (ref as React.MutableRefObject<PatientEligibilityTabHandle | null>).current;
    const currentValues = currentRef?.getValues();
    if (currentValues) {
      await onSave(currentValues);
      setHasUnsavedChanges(false);
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
        servicesRequiringReferrals,
        insurancePlansRequiringReferrals,
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
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
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
                  setNewPatients(checked);
                  handleFieldChange();
                }}
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
                  setExistingPatients(checked);
                  handleFieldChange();
                }}
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
                  setSelfPay(checked);
                  handleFieldChange();
                }}
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
                  setHmo(checked);
                  handleFieldChange();
                }}
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
                  setPpo(checked);
                  handleFieldChange();
                }}
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
                  setMedicare(checked);
                  handleFieldChange();
                }}
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
                  setMedicaid(checked);
                  handleFieldChange();
                }}
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
            <div className="space-y-2">
              <Label htmlFor="services-referrals" className="text-sm font-semibold text-[#1c275e]">Services Requiring Referrals</Label>
              <Textarea
                id="services-referrals"
                placeholder="Enter services that require referrals (one per line)"
                value={servicesRequiringReferrals}
                onChange={(e) => {
                  setServicesRequiringReferrals(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance-referrals" className="text-sm font-semibold text-[#1c275e]">Insurance Plans Requiring Referrals</Label>
              <Textarea
                id="insurance-referrals"
                placeholder="Enter insurance plans that require referrals (one per line)"
                value={insurancePlansRequiringReferrals}
                onChange={(e) => {
                  setInsurancePlansRequiringReferrals(e.target.value);
                  handleFieldChange();
                }}
                className="min-h-32 resize-none border-gray-300 focus:border-[#f48024] focus:ring-[#f48024]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PatientEligibilityTab;
