import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { OrgLocation } from "@/components/launchpad/types";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpecialtyRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

interface LocationCardProps {
  location: OrgLocation;
  index: number;
  onChange: (updates: Partial<OrgLocation>) => void;
  onDelete: () => void;
  onEditSpecialtyServices: (specialityIndex: number) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function LocationCard({
  location,
  index,
  onChange,
  onDelete,
  onEditSpecialtyServices,
  isMinimized = false,
  onToggleMinimize,
}: LocationCardProps) {
  const specialtyRefs = React.useRef<SpecialtyRefs>({});

  // Initialize refs for all specialties
  React.useEffect(() => {
    location.specialties_services.forEach((_, index) => {
      if (!specialtyRefs.current[index]) {
        specialtyRefs.current[index] = React.createRef<HTMLDivElement>();
      }
    });
  }, [location.specialties_services]);

  // Specialty removal confirmation dialog state
  const [specialtyDeleteDialog, setSpecialtyDeleteDialog] = React.useState<{
    open: boolean;
    specialtyIndex?: number;
    specialtyName?: string;
  }>({ open: false });

  const handleAddSpecialty = () => {
    onChange({ specialties_services: [...location.specialties_services, { speciality_name: "", services: [] }] });
  };

  // Specialty removal confirmation handlers
  const handleDeleteSpecialty = (specialtyIndex: number, specialtyName: string) => {
    setSpecialtyDeleteDialog({
      open: true,
      specialtyIndex,
      specialtyName
    });
  };

  const handleConfirmSpecialtyDelete = () => {
    if (specialtyDeleteDialog.specialtyIndex !== undefined) {
      const newSpecs = location.specialties_services.filter((_, i) => i !== specialtyDeleteDialog.specialtyIndex);
      onChange({ specialties_services: newSpecs });
      setSpecialtyDeleteDialog({ open: false });
    }
  };
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

        <div className="space-y-4 mb-4">
          <Label className="text-base font-semibold text-[#1C275E]">Specialties & Services</Label>
            <div className="space-y-3">
              {location.specialties_services.map((spec, sIndex) => (
                <div key={`specialty-${sIndex}`} ref={specialtyRefs.current[sIndex]} className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-[#1C275E]/30 transition-all duration-300">
                  <Input
                    className="border-0 bg-transparent focus:ring-0"
                    value={spec.speciality_name}
                    onChange={(e) => {
                      const newSpecs = location.specialties_services.slice();
                      newSpecs[sIndex] = { ...newSpecs[sIndex], speciality_name: e.target.value };
                      onChange({ specialties_services: newSpecs });
                    }}
                    placeholder="Specialty name"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditSpecialtyServices(sIndex)} className="border-[#F48024] text-[#F48024] hover:bg-[#F48024] hover:text-white">
                    Edit Services ({spec.services.length})
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="bg-white text-black border border-black hover:bg-gray-50"
                    onClick={() => handleDeleteSpecialty(sIndex, spec.speciality_name)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="default" size="sm" onClick={handleAddSpecialty} className="bg-[#F48024] hover:bg-[#F48024]/90 text-white">
                Add Specialty
              </Button>
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

        <div className="flex items-center space-x-2">
          <Switch
            id={`location-active-${location.id}`}
            checked={location.is_active}
            onCheckedChange={(checked) => onChange({ is_active: checked })}
          />
          <Label htmlFor={`location-active-${location.id}`} className="text-xs font-medium text-[#1C275E]">Is Active</Label>
        </div>
        </CardContent>
      )}

      {/* Specialty Deletion Confirmation Dialog */}
      <AlertDialog open={specialtyDeleteDialog.open} onOpenChange={() => setSpecialtyDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this specialty?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSpecialtyDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}


