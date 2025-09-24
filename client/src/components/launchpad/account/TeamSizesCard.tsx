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
          <Label className="text-xs font-medium text-[#1C275E]">Order Entry Team Size</Label>
          <div className="relative">
            <Input
              type="number"
              className="border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="Number of employees"
              value={orderEntryTeamSize ?? ""}
              onChange={(e) => onChange("orderEntryTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Scheduling Team Size</Label>
          <div className="relative">
            <Input
              type="number"
              className="border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="Number of employees"
              value={schedulingTeamSize ?? ""}
              onChange={(e) => onChange("schedulingTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Patient Intake Team Size</Label>
          <div className="relative">
            <Input
              type="number"
              className="border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="Number of employees"
              value={patientIntakeTeamSize ?? ""}
              onChange={(e) => onChange("patientIntakeTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">RCM Team Size</Label>
          <div className="relative">
            <Input
              type="number"
              className="border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="Number of employees"
              value={rcmTeamSize ?? ""}
              onChange={(e) => onChange("rcmTeamSize", e.target.value === "" ? undefined : Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


