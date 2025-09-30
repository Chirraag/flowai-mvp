import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/form-error";
import { ValidationInput } from "@/components/ui/validation-components";
import type { ValidationError } from "@/lib/launchpad.utils";

interface AccountOverviewCardProps {
  accountName: string;
  websiteAddress: string;
  headquartersAddress: string;
  onChange: (field: "accountName" | "websiteAddress" | "headquartersAddress", value: string) => void;
  readOnly?: boolean;
  fieldErrors?: Record<string, ValidationError | null>;
  errors?: Record<string, string>;
}

export default function AccountOverviewCard({
  accountName,
  websiteAddress,
  headquartersAddress,
  onChange,
  readOnly = false,
  fieldErrors = {},
  errors = {},
}: AccountOverviewCardProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Account Name</Label>
          <ValidationInput
            className="mt-2"
            placeholder="Enter practice name"
            value={accountName}
            onChange={readOnly ? undefined : (e) => onChange("accountName", e.target.value)}
            readOnly={readOnly}
            error={fieldErrors.accountName || undefined}
            validationStatus={fieldErrors.accountName ? 'invalid' : (accountName.trim() ? 'valid' : 'neutral')}
            showValidationIcon={!readOnly}
            showErrorMessage={!readOnly}
            showSuggestion={!readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Website Address</Label>
          <div className="space-y-1">
            <Input
              className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
              placeholder="https://yourpractice.com"
              value={websiteAddress}
              onChange={readOnly ? undefined : (e) => onChange("websiteAddress", e.target.value)}
              readOnly={readOnly}
            />
            <FieldError error={errors.websiteAddress} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-black uppercase tracking-wide">Headquarters Address</Label>
        <div className="space-y-1">
          <Textarea
            className="mt-2 min-h-[80px] border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
            placeholder="Enter complete address"
            value={headquartersAddress}
            onChange={readOnly ? undefined : (e) => onChange("headquartersAddress", e.target.value)}
            readOnly={readOnly}
          />
          <FieldError error={errors.headquartersAddress} />
        </div>
      </div>
    </div>
  );
}


