import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IOSSwitch } from "@/components/ui/ios-switch";
import { Users, FileText } from "lucide-react";
import type { PatientEligibilityValues } from "@/types/schedulingAgent";

/**
 * PatientEligibilityTab
 * - Patient types and referral requirements configuration
 * - Mirrors the launchpad tab styling and structure
 */
export type PatientEligibilityTabProps = {
  initialValues?: PatientEligibilityValues;
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

const PatientEligibilityTab = forwardRef<PatientEligibilityTabHandle, PatientEligibilityTabProps>((props, ref) => {
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

  // Set initial values when props change
  useEffect(() => {
    if (props.initialValues) {
      setNewPatients(props.initialValues.patientTypes.newPatients);
      setExistingPatients(props.initialValues.patientTypes.existingPatients);
      setSelfPay(props.initialValues.patientTypes.selfPay);
      setHmo(props.initialValues.patientTypes.hmo);
      setPpo(props.initialValues.patientTypes.ppo);
      setMedicare(props.initialValues.patientTypes.medicare);
      setMedicaid(props.initialValues.patientTypes.medicaid);
      setServicesRequiringReferrals(props.initialValues.referralRequirements.servicesRequiringReferrals);
      setInsurancePlansRequiringReferrals(props.initialValues.referralRequirements.insurancePlansRequiringReferrals);
    }
  }, [props.initialValues]);

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
      {/* Patient Types Accepted Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Patient Types Accepted</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure which patient types can be scheduled</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="new-patients" className="text-gray-900">New patients</Label>
              <IOSSwitch
                id="new-patients"
                checked={newPatients}
                onCheckedChange={setNewPatients}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="existing-patients" className="text-gray-900">Existing Patients</Label>
              <IOSSwitch
                id="existing-patients"
                checked={existingPatients}
                onCheckedChange={setExistingPatients}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="self-pay" className="text-gray-900">Self-Pay</Label>
              <IOSSwitch
                id="self-pay"
                checked={selfPay}
                onCheckedChange={setSelfPay}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hmo" className="text-gray-900">HMO</Label>
              <IOSSwitch
                id="hmo"
                checked={hmo}
                onCheckedChange={setHmo}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ppo" className="text-gray-900">PPO</Label>
              <IOSSwitch
                id="ppo"
                checked={ppo}
                onCheckedChange={setPpo}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="medicare" className="text-gray-900">Medicare</Label>
              <IOSSwitch
                id="medicare"
                checked={medicare}
                onCheckedChange={setMedicare}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="medicaid" className="text-gray-900">Medicaid</Label>
              <IOSSwitch
                id="medicaid"
                checked={medicaid}
                onCheckedChange={setMedicaid}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Requirements Card */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" />
            <h2 className="text-xl font-semibold text-gray-900">Referral Requirements</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">Configure referral requirements by insurance or service</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="services-referrals">Services Requiring Referrals</Label>
              <Textarea
                id="services-referrals"
                placeholder="Enter services that require referrals (one per line)"
                value={servicesRequiringReferrals}
                onChange={(e) => setServicesRequiringReferrals(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance-referrals">Insurance Plans Requiring Referrals</Label>
              <Textarea
                id="insurance-referrals"
                placeholder="Enter insurance plans that require referrals (one per line)"
                value={insurancePlansRequiringReferrals}
                onChange={(e) => setInsurancePlansRequiringReferrals(e.target.value)}
                className="min-h-24 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default PatientEligibilityTab;
