import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrgStructureCardProps {
  schedulingStructure: string;
  rcmStructure: string;
  onChange: (field: "schedulingStructure" | "rcmStructure", value: string) => void;
}

export default function OrgStructureCard({
  schedulingStructure,
  rcmStructure,
  onChange,
}: OrgStructureCardProps) {
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Scheduling Structure</Label>
            <div className="relative">
              <Select
                value={schedulingStructure}
                onValueChange={(value) => onChange("schedulingStructure", value)}
              >
                <SelectTrigger className="h-10 pl-4 pr-4 py-3 border border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 rounded-lg transition">
                  <SelectValue placeholder="Select scheduling structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centralized">Centralized</SelectItem>
                  <SelectItem value="Decentralized">Decentralized</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">RCM Structure</Label>
            <div className="relative">
              <Select
                value={rcmStructure}
                onValueChange={(value) => onChange("rcmStructure", value)}
              >
                <SelectTrigger className="h-10 pl-4 pr-4 py-3 border border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 rounded-lg transition">
                  <SelectValue placeholder="Select RCM structure" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-house">In-house</SelectItem>
                  <SelectItem value="Partially Outsourced">Partially Outsourced</SelectItem>
                  <SelectItem value="Fully Outsourced">Fully Outsourced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
    </div>
  );
}


