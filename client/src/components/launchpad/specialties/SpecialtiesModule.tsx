import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgSpecialityService, SpecialtyServiceEntry, OrgLocation } from "@/components/launchpad/types";
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

interface SpecialtiesModuleProps {
  specialties: OrgSpecialityService[];
  locations: OrgLocation[]; // Available locations for selection
  locationOptions?: { value: string; label: string }[];
  unresolvedNotice?: (specId: string, unresolvedCodes: string[]) => void;
  onSwitchTab?: (tab: string) => void;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<OrgSpecialityService>) => void;
  onRemove: (id: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function SpecialtiesModule({
  specialties,
  locations,
  locationOptions,
  unresolvedNotice,
  onSwitchTab,
  onAdd,
  onUpdate,
  onRemove,
  onSave,
  isSaving = false,
}: SpecialtiesModuleProps) {
  const [locationSearchTerm, setLocationSearchTerm] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const specialtyRefs = React.useRef<SpecialtyRefs>({});

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = React.useState<Record<string, boolean>>({});

  // Active tab state for each specialty card
  const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});

  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    specialtyId?: string;
    specialtyName?: string;
  }>({ open: false });

  const toggleCardMinimize = (cardId: string) => {
    setMinimizedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleTabChange = (cardId: string, tabValue: string) => {
    setActiveTabs(prev => ({
      ...prev,
      [cardId]: tabValue
    }));
  };

  const knownCodes = React.useMemo(() => new Set(locations.map(l => l.location_id)), [locations]);
  const unresolvedAll = React.useMemo(() => specialties.flatMap(s => s.location_ids.filter(code => !knownCodes.has(code))), [specialties, knownCodes]);
  const hasUnresolved = unresolvedAll.length > 0;

  const filteredSpecialties = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return specialties;
    return specialties.filter(spec => (spec.specialty_name || '').toLowerCase().includes(term));
  }, [specialties, searchTerm]);

  const handleAddSpecialty = () => {
    // Ensure newly added card is visible even when a filter is active
    setSearchTerm('');
    onAdd();
    // Scroll to new card after a short delay to ensure it's rendered
    setTimeout(() => {
      const specialtyCards = document.querySelectorAll('[data-specialty-card]');
      const newCard = specialtyCards[specialtyCards.length - 1];
      newCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Deletion confirmation handlers
  const handleDeleteSpecialty = (specialtyId: string, specialtyName: string) => {
    setDeleteDialog({
      open: true,
      specialtyId,
      specialtyName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.specialtyId) {
      onRemove(deleteDialog.specialtyId);
      setDeleteDialog({ open: false });
    }
  };

  // Initialize refs for all specialties
  React.useEffect(() => {
    specialties.forEach(spec => {
      if (!specialtyRefs.current[spec.id]) {
        specialtyRefs.current[spec.id] = React.createRef<HTMLDivElement>();
      }
    });
  }, [specialties]);
  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl">
      <CardHeader className="sticky top-0 z-50 bg-[#1C275E] text-white p-3 border-b border-[#1C275E]/20 shadow-sm rounded-t-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#F48024]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="11" strokeWidth="3" />
                      <path d="M12 8v8M8 12h8" strokeWidth="5" />
                    </svg>
            </div>
            <CardTitle className="text-lg font-semibold">Specialties</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search specialties..."
              aria-label="Search specialties"
              className="h-8 w-[160px] sm:w-[220px] md:w-[280px] bg-white text-[#1C275E] placeholder:text-[#1C275E]/60"
            />
            <Button
              variant="outline"
              onClick={() => {
                const documentsSection = document.getElementById('specialties-documents');
                if (documentsSection) {
                  documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-white text-[#1C275E] border-white hover:bg-gray-100"
            >
              View Documents
            </Button>
            {onSave && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="min-w-[100px] bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
            <Button variant="default" onClick={handleAddSpecialty} className="bg-[#F48024] hover:bg-[#F48024]/90 text-white">Add Specialty</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {hasUnresolved && (
          <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm flex items-center justify-between">
            <div>Some specialties reference unknown location codes: {Array.from(new Set(unresolvedAll)).join(', ')}. Add the missing locations in the Locations tab or update selections.</div>
            <a href="#" className="underline ml-2" onClick={(e) => {
              e.preventDefault();
              onSwitchTab?.('locations');
            }}>Add Location</a>
          </div>
        )}
        {specialties.length > 0 && filteredSpecialties.length === 0 && (
          <p className="text-sm text-muted-foreground">No specialties match your search.</p>
        )}
        {filteredSpecialties.map((spec) => {
          const cardId = `specialty-${spec.id}`;
          return (
            <Card key={spec.id} className="border-0 shadow-lg bg-white rounded-xl overflow-hidden" data-specialty-card>
              <CardHeader className="bg-[#1C275E] text-white p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-[#F48024]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="11" strokeWidth="3" />
                      <path d="M12 8v8M8 12h8" strokeWidth="5" />
                    </svg>
                    </div>
                    <CardTitle className="text-lg font-semibold">{spec.specialty_name || "Specialty"}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="bg-white text-black border border-black hover:bg-gray-50" onClick={() => handleDeleteSpecialty(spec.id, spec.specialty_name || 'this specialty')}>Delete</Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardMinimize(cardId)}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E]"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={minimizedCards[cardId] ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{minimizedCards[cardId] ? 'Expand' : 'Minimize'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              {!minimizedCards[cardId] && (
                <CardContent className="p-0">
                  <Tabs
                    value={activeTabs[cardId] || "basic"}
                    onValueChange={(value) => handleTabChange(cardId, value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b bg-transparent">
                      <TabsTrigger
                        value="basic"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1C275E] data-[state=active]:bg-transparent"
                      >
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger
                        value="sources"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1C275E] data-[state=active]:bg-transparent"
                      >
                        Sources
                      </TabsTrigger>
                      <TabsTrigger
                        value="services"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1C275E] data-[state=active]:bg-transparent"
                      >
                        Services
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="p-4 space-y-4">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">Specialty Name</Label>
                        <Input className="mt-1" placeholder="e.g., Cardiology" value={spec.specialty_name} onChange={(e) => onUpdate(spec.id, { specialty_name: e.target.value })} />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Associated Locations</Label>
                        <div className="mt-2">
                          <div className="border rounded-md p-3">
                            <div className="mb-2">
                              <Input
                                placeholder="Search locations..."
                                value={locationSearchTerm}
                                onChange={(e) => setLocationSearchTerm(e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                              {(() => {
                                const filteredLocations = locations.filter(location =>
                                  location.name.toLowerCase().includes(locationSearchTerm.toLowerCase()) ||
                                  location.location_id.toLowerCase().includes(locationSearchTerm.toLowerCase())
                                );
                                return filteredLocations.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">No locations match your search</p>
                                ) : (
                                  filteredLocations.map((location) => (
                                    <Button
                                      key={location.id}
                                      variant="outline"
                                      size="sm"
                                      className={`relative px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        spec.location_ids.includes(location.location_id)
                                          ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                                          : 'bg-white text-[#1C275E] border-gray-300 hover:bg-gray-200'
                                      }`}
                                      onClick={() => {
                                        const next = new Set(spec.location_ids);
                                        if (next.has(location.location_id)) {
                                          next.delete(location.location_id);
                                        } else {
                                          next.add(location.location_id);
                                        }
                                        onUpdate(spec.id, { location_ids: Array.from(next) });
                                      }}
                                    >
                                      {location.name} ({location.location_id})
                                      {spec.location_ids.includes(location.location_id) && <Check className="w-3 h-3 ml-1 inline" />}
                                    </Button>
                                  ))
                                );
                              })()}
                            </div>
                            {(() => {
                              const knownCodes = new Set(locations.map(l => l.location_id));
                              const unresolved = spec.location_ids.filter(code => !knownCodes.has(code));
                              if (unresolved.length === 0) return null;
                              unresolvedNotice?.(spec.id, unresolved);
                              return (
                                <div className="flex items-center justify-between text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 text-sm mt-2">
                                  <div>Unresolved codes: {unresolved.join(', ')}</div>
                                  <a href="#" className="underline" onClick={(e) => {
                                    e.preventDefault();
                                    onSwitchTab?.('locations');
                                  }}>Add location</a>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`specialty-active-${spec.id}`}
                          checked={spec.is_active}
                          onCheckedChange={(checked) => onUpdate(spec.id, { is_active: checked })}
                        />
                        <Label htmlFor={`specialty-active-${spec.id}`}>Is Active</Label>
                      </div>
                    </TabsContent>

                    <TabsContent value="sources" className="p-4 space-y-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Physician Names Source</Label>
                            <Input className="mt-1" placeholder="Source type (e.g., EMR)" value={spec.physician_names_source_type || ""} onChange={(e) => onUpdate(spec.id, { physician_names_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.physician_names_source_link || ""} onChange={(e) => onUpdate(spec.id, { physician_names_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">New Patients Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.new_patients_source_type || ""} onChange={(e) => onUpdate(spec.id, { new_patients_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.new_patients_source_link || ""} onChange={(e) => onUpdate(spec.id, { new_patients_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Physician Locations Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.physician_locations_source_type || ""} onChange={(e) => onUpdate(spec.id, { physician_locations_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.physician_locations_source_link || ""} onChange={(e) => onUpdate(spec.id, { physician_locations_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Physician Credentials Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.physician_credentials_source_type || ""} onChange={(e) => onUpdate(spec.id, { physician_credentials_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.physician_credentials_source_link || ""} onChange={(e) => onUpdate(spec.id, { physician_credentials_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Services Offered Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.services_offered_source_type || ""} onChange={(e) => onUpdate(spec.id, { services_offered_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.services_offered_source_link || ""} onChange={(e) => onUpdate(spec.id, { services_offered_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Patient Prep Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.patient_prep_source_type || ""} onChange={(e) => onUpdate(spec.id, { patient_prep_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.patient_prep_source_link || ""} onChange={(e) => onUpdate(spec.id, { patient_prep_source_link: e.target.value })} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm font-medium">Patient FAQs Source</Label>
                            <Input className="mt-1" placeholder="Source type" value={spec.patient_faqs_source_type || ""} onChange={(e) => onUpdate(spec.id, { patient_faqs_source_type: e.target.value })} />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Source Link</Label>
                            <Input className="mt-1" placeholder="URL" value={spec.patient_faqs_source_link || ""} onChange={(e) => onUpdate(spec.id, { patient_faqs_source_link: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="services" className="p-4 space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Services</Label>
                        <div className="space-y-4 mt-2">
                          {spec.services.map((svc, i) => (
                            <div key={i}>
                              <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3 bg-white shadow-sm">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-[#1C275E]">Service Name</Label>
                                  <Input placeholder="e.g., MRI Scan, Blood Test" value={svc.name} onChange={(e) => {
                                    const next: SpecialtyServiceEntry[] = spec.services.slice();
                                    next[i] = { ...next[i], name: e.target.value };
                                    onUpdate(spec.id, { services: next });
                                  }} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-[#1C275E]">Patient Preparation Requirements</Label>
                                  <Textarea placeholder="Describe what patients need to do before this service" value={svc.patient_prep_requirements || ""} onChange={(e) => {
                                    const next = spec.services.slice();
                                    next[i] = { ...next[i], patient_prep_requirements: e.target.value };
                                    onUpdate(spec.id, { services: next });
                                  }} />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium text-[#1C275E]">Frequently Asked Questions</Label>
                                  <Textarea placeholder="Common questions and answers about this service" value={svc.faq || ""} onChange={(e) => {
                                    const next = spec.services.slice();
                                    next[i] = { ...next[i], faq: e.target.value };
                                    onUpdate(spec.id, { services: next });
                                  }} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium text-[#1C275E]">Service Information Name</Label>
                                    <Input placeholder="e.g., Procedure Details, Cost Information" value={svc.service_information_name || ""} onChange={(e) => {
                                      const next = spec.services.slice();
                                      next[i] = { ...next[i], service_information_name: e.target.value };
                                      onUpdate(spec.id, { services: next });
                                    }} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-sm font-medium text-[#1C275E]">Information Source</Label>
                                    <Input
                                      placeholder="Source of this information"
                                      value={svc.service_information_source || ""}
                                      onChange={(e) => {
                                        const next = spec.services.slice();
                                        next[i] = { ...next[i], service_information_source: e.target.value };
                                        onUpdate(spec.id, { services: next });
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button variant="default" size="sm" className="bg-white text-black border border-black hover:bg-gray-50" onClick={() => {
                                    const next = spec.services.filter((_, idx) => idx !== i);
                                    onUpdate(spec.id, { services: next });
                                  }}>Remove</Button>
                                </div>
                              </div>
                              {i < spec.services.length - 1 && (
                                <div className="border-t-2 border-gray-600 my-4"></div>
                              )}
                            </div>
                          ))}
                          <Button variant="default" size="sm" onClick={() => onUpdate(spec.id, { services: [...spec.services, { name: "" }] })} className="bg-[#F48024] hover:bg-[#F48024]/90 text-white">Add Service</Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          );
        })}
        {specialties.length === 0 && (
          <p className="text-sm text-muted-foreground">No specialties added yet. Click "Add Specialty" to get started.</p>
        )}
      </CardContent>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.specialtyName}"?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}


