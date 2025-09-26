import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TeamSizesCardProps {
  orderEntryTeamSize?: number;
  schedulingTeamSize?: number;
  patientIntakeTeamSize?: number;
  rcmTeamSize?: number;
  onChange: (
    field:
      | "orderEntryTeamSize"
      | "schedulingTeamSize"
      | "patientIntakeTeamSize"
      | "rcmTeamSize",
    value: number | undefined
  ) => void;
}

export default function TeamSizesCard({
  orderEntryTeamSize,
  schedulingTeamSize,
  patientIntakeTeamSize,
  rcmTeamSize,
  onChange,
}: TeamSizesCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Order Entry Team Size</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Number of employees"
            value={orderEntryTeamSize ?? ""}
            onChange={(e) => onChange("orderEntryTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Scheduling Team Size</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Number of employees"
            value={schedulingTeamSize ?? ""}
            onChange={(e) => onChange("schedulingTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Patient Intake Team Size</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Number of employees"
            value={patientIntakeTeamSize ?? ""}
            onChange={(e) => onChange("patientIntakeTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">RCM Team Size</Label>
          <Input
            className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            type="number"
            placeholder="Number of employees"
            value={rcmTeamSize ?? ""}
            onChange={(e) => onChange("rcmTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}


