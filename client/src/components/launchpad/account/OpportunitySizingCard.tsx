import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AccountOpportunitySizing } from "@/components/launchpad/types";

interface OpportunitySizingCardProps {
  opportunitySizing: AccountOpportunitySizing;
  onChange: (updates: Partial<AccountOpportunitySizing>) => void;
}

export default function OpportunitySizingCard({
  opportunitySizing,
  onChange,
}: OpportunitySizingCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Monthly Orders Entered</Label>
          <div className="relative">
            <Input
              type="number"
              className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Total monthly orders"
              value={opportunitySizing.monthly_orders_count ?? ""}
              onChange={(e) => onChange({
                monthly_orders_count: e.target.value === "" ? undefined : Number(e.target.value)
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Monthly Patients Scheduled</Label>
          <div className="relative">
            <Input
              type="number"
              className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Total monthly scheduled patients"
              value={opportunitySizing.monthly_patients_scheduled ?? ""}
              onChange={(e) => onChange({
                monthly_patients_scheduled: e.target.value === "" ? undefined : Number(e.target.value)
              })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Monthly Patients Checked In</Label>
          <div className="relative">
            <Input
              type="number"
              className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Total monthly check-ins"
              value={opportunitySizing.monthly_patients_checked_in ?? ""}
              onChange={(e) => onChange({
                monthly_patients_checked_in: e.target.value === "" ? undefined : Number(e.target.value)
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
