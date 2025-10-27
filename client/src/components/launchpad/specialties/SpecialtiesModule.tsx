import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check, X, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ValidationInput } from "@/components/ui/validation-components";
import { usePermissions } from "@/context/AuthContext";
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
import type { ValidationError } from "@/lib/launchpad.utils";

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
  readOnly?: boolean;
  fieldErrors?: Record<string, ValidationError | null>;
}

function SpecialtiesModule({
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
  readOnly: readOnlyProp,
  fieldErrors = {},
}: SpecialtiesModuleProps) {
  const { canEditSpecialties } = usePermissions();
  const readOnly = readOnlyProp ?? !canEditSpecialties;
  const [locationSearchTerm, setLocationSearchTerm] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const specialtyRefs = React.useRef<SpecialtyRefs>({});

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = React.useState<Record<string, boolean>>({});

  // Active tab state for each specialty card
  const [activeTabs, setActiveTabs] = React.useState<Record<string, string>>({});
  const [serviceSelections, setServiceSelections] = React.useState<Record<string, number | null>>({});

  // Scroll-aware header state
  const [isScrolled, setIsScrolled] = React.useState(false);

  const [removeServiceDialog, setRemoveServiceDialog] = React.useState<{
    open: boolean;
    specialtyId?: string;
    serviceIndex?: number;
    serviceName?: string;
  }>({ open: false });


  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    specialtyId?: string;
    specialtyName?: string;
  }>({ open: false });

  // Scroll detection effect for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10); // Reduced trigger threshold for smoother animation
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setServiceSelections(prev => {
        const current = prev[spec.id];
        if (current === undefined || current === null || current >= spec.services.length) {
          return { ...prev, [spec.id]: spec.services.length > 0 ? null : null };
        }
        return prev;
      });
    });
  }, [specialties]);

  const handleSelectService = (specialtyId: string, index: number | null) => {
    setServiceSelections(prev => ({ ...prev, [specialtyId]: index }));
  };
  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200">
      <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 rounded-t-2xl transition-all duration-300 ${
        isScrolled
          ? 'p-1.5 shadow-lg shadow-black/10'
          : 'p-2 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#F48024]"
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
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search specialties..."
                aria-label="Search specialties"
                className="h-8 w-[140px] sm:w-[180px] md:w-[220px] bg-white text-[#1C275E] placeholder:text-[#1C275E]/60 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 pr-8 transition text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                  aria-label="Clear specialties search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const documentsSection = document.getElementById('specialties-documents');
                if (documentsSection) {
                  documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white h-8 px-3 text-sm"
            >
              Docs
            </Button>
            {onSave && !readOnly && (
              <Button
                onClick={onSave}
                disabled={isSaving}
                className="min-w-[80px] bg-white hover:bg-slate-400 active:bg-slate-500 text-[#1c275e] border-[#1c275e] focus:ring-2 focus:ring-[#1c275e] focus:ring-offset-2 h-8 px-3 text-sm"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
            {!readOnly && (
              <Button variant="default" onClick={handleAddSpecialty} className="bg-[#f49024] hover:bg-[#d87f1f] text-white h-8 px-3 text-sm">Add Specialty</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {hasUnresolved && (
          <div className="text-amber-700 bg-amber-50/90 border border-amber-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
            <div>Some specialties reference unknown location codes: {Array.from(new Set(unresolvedAll)).join(', ')}. Add the missing locations in the Locations tab or update selections.</div>
                                  <a href="#" className="text-[#1c275e] hover:underline ml-2" onClick={(e) => {
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
            <Card
              key={spec.id}
              className="border border-slate-200/70 bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] focus-within:shadow-md focus-within:-translate-y-[1px]"
              data-specialty-card
            >
              <CardHeader
                onClick={() => toggleCardMinimize(cardId)}
                className="cursor-pointer bg-[#eef2ff] text-[#1C275E] p-1.5 border-b border-slate-200 transition-colors hover:bg-[#e0e7ff]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#F48024]/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-4.5 h-4.5 text-[#F48024]"
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
                    <CardTitle className="text-lg font-semibold tracking-tight">{spec.specialty_name || "Specialty"}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {!readOnly && (
              <Button
                         variant="outline"
                         size="sm"
                         className="border-[#c0352b]/40 text-[#c0352b] hover:bg-[#c0352b] hover:text-white focus-visible:ring-2 focus-visible:ring-[#c0352b]/40 focus-visible:outline-none"
                         onClick={(event) => {
                           event.stopPropagation();
                           handleDeleteSpecialty(spec.id, spec.specialty_name || 'this specialty');
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
                              toggleCardMinimize(cardId);
                            }}
                            className="bg-[#F48024] text-white hover:bg-[#C96A1E] focus-visible:ring-2 focus-visible:ring-[#fef08a] focus-visible:ring-offset-2 focus-visible:outline-none"
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
                <CardContent className="px-5 py-4">
                  <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm p-4">
                    <Tabs
                      value={activeTabs[cardId] || "basic"}
                      onValueChange={(value) => handleTabChange(cardId, value)}
                      className="w-full"
                    >
                    <TabsList className="flex w-full rounded-full border border-slate-200 bg-slate-50/70 p-0.5 h-11 items-center justify-center">
                      <TabsTrigger
                        value="basic"
                        className="flex-1 rounded-full border-transparent data-[state=active]:bg-[#eef2ff] data-[state=active]:text-[#1C275E] data-[state=active]:shadow-sm flex items-center justify-center text-center text-sm"
                      >
                        Basic Info
                      </TabsTrigger>
                      <TabsTrigger
                        value="sources"
                        className="flex-1 rounded-full border-transparent data-[state=active]:bg-[#eef2ff] data-[state=active]:text-[#1C275E] data-[state=active]:shadow-sm flex items-center justify-center text-center text-sm"
                      >
                        Sources
                      </TabsTrigger>
                      <TabsTrigger
                        value="services"
                        className="flex-1 rounded-full border-transparent data-[state=active]:bg-[#eef2ff] data-[state=active]:text-[#1C275E] data-[state=active]:shadow-sm flex items-center justify-center text-center text-sm"
                      >
                        Services
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="pt-4 space-y-4">
                      <div className="flex-1 space-y-4">
                        <div className="flex-1">
                          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Specialty Name</Label>
                          <ValidationInput
                            className="mt-2"
                            placeholder="e.g., Cardiology"
                            value={spec.specialty_name}
                            onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { specialty_name: e.target.value })}
                            readOnly={readOnly}
                            error={fieldErrors[`specialties[${specialties.findIndex(s => s.id === spec.id)}].specialty_name`] || undefined}
                            validationStatus={fieldErrors[`specialties[${specialties.findIndex(s => s.id === spec.id)}].specialty_name`] ? 'invalid' : (spec.specialty_name.trim() ? 'valid' : 'neutral')}
                            showValidationIcon={!readOnly}
                            showErrorMessage={!readOnly}
                            showSuggestion={!readOnly}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-semibold text-black uppercase tracking-wide">Associated Locations</Label>
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                placeholder="Search locations..."
                                value={locationSearchTerm}
                                onChange={(e) => setLocationSearchTerm(e.target.value)}
                                className="h-10 text-sm border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                              />
                              {locationSearchTerm && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-slate-500 hover:text-slate-700"
                                  onClick={() => setLocationSearchTerm('')}
                                >
                                  Clear
                                </Button>
                              )}
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
                                      variant={spec.location_ids.includes(location.location_id) ? 'default' : 'outline'}
                                      size="sm"
                                      className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                        spec.location_ids.includes(location.location_id)
                                          ? 'bg-[#1C275E] text-white border-[#1C275E] hover:bg-[#233072] hover:text-white'
                                          : 'bg-white text-[#1C275E] border-[#BEC4DB] hover:bg-[#1C275E]/10'
                                      }`}
                                      onClick={readOnly ? undefined : () => {
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
                                <div className="flex items-center justify-between text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm">
                                  <div>Unresolved codes: {unresolved.join(', ')}</div>
                                  <a href="#" className="underline" onClick={(e) => {
                                    e.preventDefault();
                                    onSwitchTab?.('locations');
                                  }}>Add location</a>
                                </div>
                              );
                            })()}

                            {/* Location selection validation error */}
                            {(() => {
                              const locationError = fieldErrors[`specialties[${specialties.findIndex(s => s.id === spec.id)}].location_ids`];
                              if (!locationError) return null;
                              return (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                  <AlertCircle className="w-4 h-4" />
                                  <span>{locationError.message}</span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* <div className="flex items-center space-x-2">
                        <Switch
                          id={`specialty-active-${spec.id}`}
                          checked={spec.is_active}
                          onCheckedChange={(checked) => onUpdate(spec.id, { is_active: checked })}
                        />
                        <Label htmlFor={`specialty-active-${spec.id}`}>Is Active</Label>
                      </div> */}
                    </TabsContent>

                    <TabsContent value="sources" className="pt-4">
                      <Table>
                        <TableBody>
                          {/* Physician Names */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Physician Names</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type (e.g., EMR)"
                                value={spec.physician_names_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_names_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.physician_names_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_names_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* Physician Locations */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Physician Locations</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.physician_locations_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_locations_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.physician_locations_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_locations_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* Physician Credentials */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Physician Credentials</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.physician_credentials_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_credentials_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.physician_credentials_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { physician_credentials_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* New Patients */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">New Patients</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.new_patients_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { new_patients_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.new_patients_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { new_patients_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* Patient Preparation */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Patient Preparation</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.patient_prep_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { patient_prep_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.patient_prep_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { patient_prep_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* Patient FAQs */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Patient FAQs</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.patient_faqs_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { patient_faqs_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source link"
                                value={spec.patient_faqs_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { patient_faqs_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>

                          {/* Services Offered */}
                          <TableRow>
                            <TableCell className="font-medium text-sm text-gray-900 w-1/3">Services Offered</TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source type"
                                value={spec.services_offered_source_type || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { services_offered_source_type: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                            <TableCell className="w-1/3">
                              <Input
                                className="h-10 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                placeholder="Source name"
                                value={spec.services_offered_source_name || ""}
                                onChange={readOnly ? undefined : (e) => onUpdate(spec.id, { services_offered_source_name: e.target.value })}
                                readOnly={readOnly}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TabsContent>

                    <TabsContent value="services" className="pt-4">
                      {(() => {
                        const services = spec.services;
                        const selectedIndex = serviceSelections[spec.id] ?? null;
                        const selectedService = selectedIndex !== null ? services[selectedIndex] : null;

                        const nameCounts = services.reduce<Record<string, number>>((acc, service) => {
                          const key = (service.name?.trim().toLowerCase() || 'untitled service');
                          acc[key] = (acc[key] ?? 0) + 1;
                          return acc;
                        }, {});

                        const occurrenceTracker: Record<string, number> = {};

                        const handleAddService = () => {
                          const nextServices = [...services, { name: "" } as SpecialtyServiceEntry];
                          onUpdate(spec.id, { services: nextServices });
                          handleSelectService(spec.id, services.length);
                        };

                        const handleServiceFieldChange = (field: keyof SpecialtyServiceEntry, value: string | null) => {
                          if (selectedIndex === null) return;
                          const next = services.slice();
                          next[selectedIndex] = {
                            ...next[selectedIndex],
                            [field]: field === 'name' ? (value ?? '') : value,
                          } as SpecialtyServiceEntry;
                          onUpdate(spec.id, { services: next });
                        };

                        const displayName = (service: SpecialtyServiceEntry, index: number) => {
                          const key = (service.name?.trim().toLowerCase() || 'untitled service');
                          occurrenceTracker[key] = (occurrenceTracker[key] ?? 0) + 1;
                          const baseName = service.name?.trim() || 'Untitled service';
                          return nameCounts[key] > 1 ? `${baseName} (${occurrenceTracker[key]})` : baseName;
                        };

                        return (
                          <div className="flex flex-col lg:flex-row lg:gap-6 gap-4">
                            <div className="lg:w-64 shrink-0 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                              <div className="p-4 border-b border-slate-200">
                                {!readOnly && (
                                  <Button
                                    size="sm"
                                    className="w-full bg-[#f49024] hover:bg-[#d87f1f] text-white"
                                    onClick={handleAddService}
                                  >
                                    Add Service
                                  </Button>
                                )}
                              </div>
                              <div className="p-4">
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                  {services.length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-6">No services yet</p>
                                  ) : (
                                    services.map((service, index) => {
                                      const label = displayName(service, index);
                                      const isSelected = selectedIndex === index;
                                      return (
                                        <Button
                                          key={index}
                                          variant={isSelected ? 'default' : 'ghost'}
                                          size="sm"
                                          className={`w-full justify-start text-left text-xs font-medium transition-all rounded-lg ${
                                            isSelected
                                              ? 'bg-[#1C275E] text-white hover:bg-[#233072] shadow-sm'
                                              : 'text-[#1C275E] hover:bg-white/80'
                                          }`}
                                          onClick={() => handleSelectService(spec.id, index)}
                                        >
                                          {label}
                                        </Button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[#0d9488]/50">
                              <div className="p-6">
                                {selectedService ? (
                                  <div className="space-y-5 text-sm">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                      <div className="flex-1 md:mr-4">
                                        <Label className="text-xs font-semibold text-[#1C275E] uppercase tracking-wide">Service Name</Label>
                                        <ValidationInput
                                          className="mt-2 text-sm"
                                          placeholder="e.g., MRI Scan, Blood Test"
                                          value={selectedService.name}
                                          onChange={readOnly ? undefined : (e) => handleServiceFieldChange('name', e.target.value)}
                                          readOnly={readOnly}
                                          error={fieldErrors[`specialties[${specialties.findIndex(s => s.id === spec.id)}].services[${selectedIndex}].name`] || undefined}
                                          validationStatus={fieldErrors[`specialties[${specialties.findIndex(s => s.id === spec.id)}].services[${selectedIndex}].name`] ? 'invalid' : (selectedService.name.trim() ? 'valid' : 'neutral')}
                                          showValidationIcon={!readOnly}
                                          showErrorMessage={!readOnly}
                                          showSuggestion={!readOnly}
                                        />
                                      </div>
                                      {!readOnly && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="self-start mt-1 border-[#c0352b]/40 text-[#c0352b] hover:bg-[#c0352b] hover:text-white"
                                          onClick={() =>
                                            setRemoveServiceDialog({
                                              open: true,
                                              specialtyId: spec.id,
                                              serviceIndex: selectedIndex ?? undefined,
                                              serviceName: selectedService.name?.trim() || 'Untitled service',
                                            })
                                          }
                                        >
                                          Remove
                                        </Button>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold text-[#1C275E] uppercase tracking-wide">Patient Preparation Requirements</Label>
                                      <Textarea
                                        className="min-h-[120px] text-sm border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                        placeholder="Describe what patients need to do before this service"
                                        value={selectedService.patient_prep_requirements || ''}
                                        onChange={readOnly ? undefined : (e) => handleServiceFieldChange('patient_prep_requirements', e.target.value)}
                                        readOnly={readOnly}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold text-[#1C275E] uppercase tracking-wide">Frequently Asked Questions</Label>
                                      <Textarea
                                        className="min-h-[120px] text-sm border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 transition"
                                        placeholder="Common questions and answers about this service"
                                        value={selectedService.faq || ''}
                                        onChange={readOnly ? undefined : (e) => handleServiceFieldChange('faq', e.target.value)}
                                        readOnly={readOnly}
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-[#1C275E] uppercase tracking-wide">Service Information Name</Label>
                                        <Input
                                          className="h-10 text-sm border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
                                          placeholder="e.g., Procedure Details, Cost Information"
                                          value={selectedService.service_information_name || ''}
                                          onChange={readOnly ? undefined : (e) => handleServiceFieldChange('service_information_name', e.target.value)}
                                          readOnly={readOnly}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-[#1C275E] uppercase tracking-wide">Information Source</Label>
                                        <Input
                                          className="h-10 text-sm border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20"
                                          placeholder="Source of this information"
                                          value={selectedService.service_information_source || ''}
                                          onChange={readOnly ? undefined : (e) => handleServiceFieldChange('service_information_source', e.target.value)}
                                          readOnly={readOnly}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
                                    Select a service from the sidebar to view and edit details.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </TabsContent>
                  </Tabs>
                  </div>
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
              className="bg-[#c0352b] hover:bg-[#a02c24] text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={removeServiceDialog.open}
        onOpenChange={(open) => {
          if (!open) setRemoveServiceDialog({ open: false });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{removeServiceDialog.serviceName}" from this specialty?
              This change will be applied when you click Save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRemoveServiceDialog({ open: false })}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#c0352b] hover:bg-[#a02c24] text-white"
              onClick={() => {
                if (
                  removeServiceDialog.specialtyId &&
                  removeServiceDialog.serviceIndex !== undefined
                ) {
                  const specialty = specialties.find(
                    (spec) => spec.id === removeServiceDialog.specialtyId
                  );
                  if (specialty) {
                    const nextServices = specialty.services.filter(
                      (_, idx) => idx !== removeServiceDialog.serviceIndex
                    );
                    onUpdate(removeServiceDialog.specialtyId, { services: nextServices });
                    const currentSelection = serviceSelections[removeServiceDialog.specialtyId];
                    if (
                      currentSelection !== null &&
                      currentSelection === removeServiceDialog.serviceIndex
                    ) {
                      handleSelectService(removeServiceDialog.specialtyId, null);
                    } else if (
                      currentSelection !== null &&
                      removeServiceDialog.serviceIndex !== undefined &&
                      currentSelection > removeServiceDialog.serviceIndex
                    ) {
                      handleSelectService(
                        removeServiceDialog.specialtyId,
                        currentSelection - 1
                      );
                    }
                  }
                }
                setRemoveServiceDialog({ open: false });
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export default React.memo(SpecialtiesModule);
