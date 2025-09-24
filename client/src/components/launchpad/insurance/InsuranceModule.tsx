import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { OrgInsurance } from "@/components/launchpad/types";

interface InsuranceModuleProps {
  insurance: OrgInsurance;
  onChange: (updates: Partial<OrgInsurance>) => void;
}

// Helper function to get the selected value
const getSelectedValue = (source: string | null | undefined): string => {
  return source || "";
};

export default function InsuranceModule({ insurance, onChange }: InsuranceModuleProps) {
  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden">
      <CardHeader className="bg-[#e2e8f0] text-[#1C275E] p-3 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold">Insurance & Billing</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Accepted Payers Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "Website", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.accepted_payers_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#1C275E] hover:bg-[#1C275E] hover:text-white'
                    }`}
                    onClick={() => {
                      onChange({ accepted_payers_source: isSelected ? null : option });
                    }}
                  >
                    {option}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-sm">Accepted Payers Details</Label>
            <Textarea className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a]" value={insurance.accepted_payers_source_details || ""} onChange={(e) => onChange({ accepted_payers_source_details: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Insurance Verification Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.insurance_verification_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#1C275E] hover:bg-[#1C275E] hover:text-white'
                    }`}
                    onClick={() => {
                      onChange({ insurance_verification_source: isSelected ? null : option });
                    }}
                  >
                    {option}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-sm">Insurance Verification Details</Label>
            <Textarea className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a]" value={insurance.insurance_verification_source_details || ""} onChange={(e) => onChange({ insurance_verification_source_details: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Patient Copay Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.patient_copay_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#1C275E] hover:bg-[#1C275E] hover:text-white'
                    }`}
                    onClick={() => {
                      onChange({ patient_copay_source: isSelected ? null : option });
                    }}
                  >
                    {option}
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </Button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="text-sm">Patient Copay Details</Label>
            <Textarea className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a]" value={insurance.patient_copay_source_details || ""} onChange={(e) => onChange({ patient_copay_source_details: e.target.value })} />
          </div>
        </div>

        {/* <div className="flex items-center space-x-2 mt-4">
          <Switch
            id="insurance-active"
            checked={insurance.is_active}
            onCheckedChange={(checked) => onChange({ is_active: checked })}
          />
          <Label htmlFor="insurance-active">Is Active</Label>
        </div> */}
      </CardContent>
    </Card>
  );
}


