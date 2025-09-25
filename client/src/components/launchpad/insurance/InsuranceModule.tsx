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
    <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="bg-[#eef2ff] text-[#1C275E] p-3 border-b border-slate-200 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
            <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <CardTitle className="text-lg font-semibold tracking-tight">Insurance & Billing</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Accepted Payers Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "Website", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.accepted_payers_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10'
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
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Accepted Payers Details</Label>
            <Textarea className="mt-2 min-h-[80px] border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition" value={insurance.accepted_payers_source_details || ""} onChange={(e) => onChange({ accepted_payers_source_details: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Insurance Verification Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.insurance_verification_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10'
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
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Insurance Verification Details</Label>
            <Textarea className="mt-2 min-h-[80px] border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition" value={insurance.insurance_verification_source_details || ""} onChange={(e) => onChange({ insurance_verification_source_details: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Patient Copay Source</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {["EMR", "RCM", "Other"].map((option) => {
                const isSelected = getSelectedValue(insurance.patient_copay_source) === option;
                return (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                        : 'bg-white text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10'
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
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Patient Copay Details</Label>
            <Textarea className="mt-2 min-h-[80px] border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition" value={insurance.patient_copay_source_details || ""} onChange={(e) => onChange({ patient_copay_source_details: e.target.value })} />
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


