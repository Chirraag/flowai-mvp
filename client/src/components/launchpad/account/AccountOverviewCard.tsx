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
              className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
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
              className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
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
            className="pl-4 pr-4 py-2 border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300 min-h-[80px]"
            placeholder="Enter complete address"
            value={headquartersAddress}
            onChange={(e) => onChange("headquartersAddress", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}


