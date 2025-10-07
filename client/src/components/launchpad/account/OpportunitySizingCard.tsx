import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/context/AuthContext";
import { AccountOpportunitySizing } from "@/components/launchpad/types";

interface OpportunitySizingCardProps {
  opportunitySizing: AccountOpportunitySizing;
  onChange: (updates: Partial<AccountOpportunitySizing>) => void;
  readOnly?: boolean;
}

export default function OpportunitySizingCard({
  opportunitySizing,
  onChange,
  readOnly: readOnlyProp,
}: OpportunitySizingCardProps) {
  const { canEditAccountDetails } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditAccountDetails;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Monthly Orders Entered</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Total monthly orders"
            value={opportunitySizing.monthly_orders_count ?? ""}
            onChange={readOnly ? undefined : (e) => onChange({
              monthly_orders_count: e.target.value === "" ? null : Number(e.target.value)
            })}
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Monthly Patients Scheduled</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Total monthly scheduled patients"
            value={opportunitySizing.monthly_patients_scheduled ?? ""}
            onChange={readOnly ? undefined : (e) => onChange({
              monthly_patients_scheduled: e.target.value === "" ? null : Number(e.target.value)
            })}
            readOnly={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Monthly Patients Checked In</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Total monthly check-ins"
            value={opportunitySizing.monthly_patients_checked_in ?? ""}
            onChange={readOnly ? undefined : (e) => onChange({
              monthly_patients_checked_in: e.target.value === "" ? null : Number(e.target.value)
            })}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
