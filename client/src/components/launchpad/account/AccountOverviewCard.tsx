import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AccountOverviewCardProps {
  accountName: string;
  websiteAddress: string;
  headquartersAddress: string;
  onChange: (field: "accountName" | "websiteAddress" | "headquartersAddress", value: string) => void;
}

export default function AccountOverviewCard({
  accountName,
  websiteAddress,
  headquartersAddress,
  onChange,
}: AccountOverviewCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Account Name</Label>
          <div className="relative">
            <Input
              id="account-name"
              className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="Enter practice name"
              value={accountName}
              onChange={(e) => onChange("accountName", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-[#1C275E]">Website Address</Label>
          <div className="relative">
            <Input
              id="website"
              className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2"
              placeholder="https://yourpractice.com"
              value={websiteAddress}
              onChange={(e) => onChange("websiteAddress", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-[#1C275E]">Headquarters Address</Label>
        <div className="relative">
          <Textarea
            id="address"
            className="mt-1 border-[#cbd5e1] focus:border-[#1C275E] focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2 min-h-[80px]"
            placeholder="Enter complete address"
            value={headquartersAddress}
            onChange={(e) => onChange("headquartersAddress", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}


