import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { OrgLocation } from "@/components/launchpad/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface LocationCardProps {
  location: OrgLocation;
  index: number;
  onChange: (updates: Partial<OrgLocation>) => void;
  onDelete: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function LocationCard({
  location,
  index,
  onChange,
  onDelete,
  isMinimized = false,
  onToggleMinimize,
}: LocationCardProps) {

  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl overflow-hidden" data-location-card>
      <CardHeader className="bg-[#1C275E] text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M9 8h6v13H9zM5 21V6a2 2 0 012-2h10a2 2 0 012 2v15" />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold">{location.name || `Location ${index + 1}`}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="bg-white text-black border border-black hover:bg-gray-50" onClick={onDelete}>
              Delete
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMinimize}
                    className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
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
        <CardContent className="p-4">

        <div className="space-y-2 mb-4">
          <Label className="text-xs font-medium text-[#1C275E]">Location Name</Label>
          <Input
            className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
            placeholder="Enter location name"
            value={location.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2 mb-4">
          <Label className="text-xs font-medium text-[#1C275E]">Location ID</Label>
          <Input
            className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
            placeholder="External location ID (e.g., LOC001)"
            value={location.location_id}
            onChange={(e) => onChange({ location_id: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-3">
            <Label className="text-xs font-medium text-[#1C275E]">Address Line 1</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Street Address"
              value={location.address_line1}
              onChange={(e) => onChange({ address_line1: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-[#1C275E]">Address Line 2</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Apt, Suite, etc."
              value={location.address_line2 || ""}
              onChange={(e) => onChange({ address_line2: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-4">
          <div className="space-y-3 col-span-2">
            <Label className="text-xs font-medium text-[#1C275E]">City</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="City"
              value={location.city}
              onChange={(e) => onChange({ city: e.target.value })}
            />
          </div>
          <div className="space-y-3 col-span-1">
            <Label className="text-xs font-medium text-[#1C275E]">State</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="State"
              value={location.state}
              onChange={(e) => onChange({ state: e.target.value })}
            />
          </div>
          <div className="space-y-3 col-span-2">
            <Label className="text-xs font-medium text-[#1C275E]">Zip</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="Zip"
              value={location.zip_code}
              onChange={(e) => onChange({ zip_code: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-3">
            <Label className="text-xs font-medium text-[#1C275E]">Weekday Hours</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="e.g., 8:00 AM - 5:00 PM"
              value={location.weekday_hours}
              onChange={(e) => onChange({ weekday_hours: e.target.value })}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-medium text-[#1C275E]">Weekend Hours</Label>
            <Input
              className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300"
              placeholder="e.g., 9:00 AM - 2:00 PM or Closed"
              value={location.weekend_hours}
              onChange={(e) => onChange({ weekend_hours: e.target.value })}
            />
          </div>
        </div>


        <div className="space-y-2 mb-4">
          <Label className="text-xs font-medium text-[#1C275E]">Parking Directions</Label>
          <Textarea
            className="border-2 border-gray-200 focus:border-[#1C275E] focus:ring-[#1C275E]/20 rounded-lg transition-all duration-300 min-h-[60px]"
            placeholder="Provide parking information and directions"
            value={location.parking_directions}
            onChange={(e) => onChange({ parking_directions: e.target.value })}
          />
        </div>

        {/* <div className="flex items-center space-x-2">
          <Switch
            id={`location-active-${location.id}`}
            checked={location.is_active}
            onCheckedChange={(checked) => onChange({ is_active: checked })}
          />
          <Label htmlFor={`location-active-${location.id}`} className="text-xs font-medium text-[#1C275E]">Is Active</Label>
        </div> */}
        </CardContent>
      )}

    </Card>
  );
}


