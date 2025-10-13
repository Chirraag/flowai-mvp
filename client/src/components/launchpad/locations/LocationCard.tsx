import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ValidationInput } from "@/components/ui/validation-components";
import { usePermissions } from "@/context/AuthContext";
import { OrgLocation } from "@/components/launchpad/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TimeRangePicker from "@/components/ui/time-range-picker";
import type { ValidationError } from "@/lib/launchpad.utils";


interface LocationCardProps {
  location: OrgLocation;
  index: number;
  onChange: (updates: Partial<OrgLocation>) => void;
  onDelete: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  readOnly?: boolean;
  fieldErrors?: Record<string, ValidationError | null>;
}

export default function LocationCard({
  location,
  index,
  onChange,
  onDelete,
  isMinimized = false,
  onToggleMinimize,
  readOnly: readOnlyProp,
  fieldErrors = {},
}: LocationCardProps) {
  const { canEditLocations } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditLocations;

  return (
    <Card className={`border ${location._isUnsaved ? 'border-orange-300 bg-orange-50' : 'border-slate-200/70 bg-white'} rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]`} data-location-card>
      <CardHeader className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]" onClick={onToggleMinimize}>
        {location._isUnsaved && (
          <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 text-center mb-2 rounded-md">
            ⚠️ Unsaved - Please save to use in specialties
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M9 8h6v13H9zM5 21V6a2 2 0 012-2h10a2 2 0 012 2v15" />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">{location.name || `Location ${index + 1}`}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                className="border-[#c0352b]/40 text-[#c0352b] hover:bg-[#c0352b] hover:text-white focus-visible:ring-2 focus-visible:ring-[#c0352b]/40 focus-visible:outline-none"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleMinimize?.();
                    }}
                    className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus-visible:ring-2 focus-visible:ring-[#fef08a] focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent className="px-5 py-4">
          <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm p-4">
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-black uppercase tracking-wide">Location Name</Label>
                <ValidationInput
                  className="mt-2"
                  placeholder="Enter location name"
                  value={location.name}
                  onChange={readOnly ? undefined : (e) => onChange({ name: e.target.value })}
                  readOnly={readOnly}
                  error={fieldErrors[`locations[${index}].name`] || undefined}
                  validationStatus={fieldErrors[`locations[${index}].name`] ? 'invalid' : (location.name.trim() ? 'valid' : 'neutral')}
                  showValidationIcon={!readOnly}
                  showErrorMessage={!readOnly}
                  showSuggestion={!readOnly}
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-black uppercase tracking-wide">Location ID</Label>
                <ValidationInput
                  className="mt-2"
                  placeholder="External location ID (e.g., LOC001)"
                  value={location.location_id}
                  onChange={readOnly ? undefined : (e) => onChange({ location_id: e.target.value })}
                  readOnly={readOnly}
                  error={fieldErrors[`locations[${index}].location_id`] || undefined}
                  validationStatus={fieldErrors[`locations[${index}].location_id`] ? 'invalid' : (location.location_id.trim() ? 'valid' : 'neutral')}
                  showValidationIcon={!readOnly}
                  showErrorMessage={!readOnly}
                  showSuggestion={!readOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-black uppercase tracking-wide">Address Line 1</Label>
                  <Input
                    className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                    placeholder="Street Address"
                    value={location.address_line1}
                    onChange={readOnly ? undefined : (e) => onChange({ address_line1: e.target.value })}
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-black uppercase tracking-wide">Address Line 2</Label>
                  <Input
                    className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                    placeholder="Apt, Suite, etc."
                    value={location.address_line2 || ""}
                    onChange={readOnly ? undefined : (e) => onChange({ address_line2: e.target.value })}
                    readOnly={readOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-semibold text-black uppercase tracking-wide">City</Label>
                  <Input
                    className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                    placeholder="City"
                    value={location.city}
                    onChange={readOnly ? undefined : (e) => onChange({ city: e.target.value })}
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-black uppercase tracking-wide">State</Label>
                  <Input
                    className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                    placeholder="State"
                    value={location.state}
                    onChange={readOnly ? undefined : (e) => onChange({ state: e.target.value })}
                    readOnly={readOnly}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-black uppercase tracking-wide">Zip</Label>
                  <Input
                    className="mt-2 h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                    placeholder="Zip"
                    value={location.zip_code}
                    onChange={readOnly ? undefined : (e) => onChange({ zip_code: e.target.value })}
                    readOnly={readOnly}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TimeRangePicker
                label="Weekday Hours"
                value={location.weekday_hours}
                onChange={(value) => onChange({ weekday_hours: value })}
                readOnly={readOnly}
                placeholder="Select weekday hours"
              />
              <TimeRangePicker
                label="Weekend Hours"
                value={location.weekend_hours}
                onChange={(value) => onChange({ weekend_hours: value })}
                readOnly={readOnly}
                showToggleButton={true}
                placeholder="Select weekend hours or mark as closed"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-black uppercase tracking-wide">Parking Directions</Label>
              <Textarea
                className="mt-2 min-h-[80px] border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                placeholder="Provide parking information and directions"
                value={location.parking_directions}
                onChange={readOnly ? undefined : (e) => onChange({ parking_directions: e.target.value })}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}


