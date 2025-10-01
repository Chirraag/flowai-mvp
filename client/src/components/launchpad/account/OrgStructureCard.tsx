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
import { usePermissions } from "@/context/AuthContext";

interface OrgStructureCardProps {
  schedulingStructure: string;
  rcmStructure: string;
  onChange: (field: "schedulingStructure" | "rcmStructure", value: string) => void;
  readOnly?: boolean;
}

export default function OrgStructureCard({
  schedulingStructure,
  rcmStructure,
  onChange,
  readOnly: readOnlyProp,
}: OrgStructureCardProps) {
  const { canEditAccountDetails } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditAccountDetails;
  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-black uppercase tracking-wide">Scheduling Structure</Label>
            <Select
              value={schedulingStructure}
              onValueChange={readOnly ? undefined : (value) => onChange("schedulingStructure", value)}
              disabled={readOnly}
            >
              <SelectTrigger className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition">
                <SelectValue placeholder="Select scheduling structure" />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Centralized">Centralized</SelectItem>
                  <SelectItem value="Decentralized">Decentralized</SelectItem>
                </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-black uppercase tracking-wide">RCM Structure</Label>
            <Select
              value={rcmStructure}
              onValueChange={readOnly ? undefined : (value) => onChange("rcmStructure", value)}
              disabled={readOnly}
            >
              <SelectTrigger className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition">
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
  );
}


