import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/launchpad/locations/LocationCard";
import { OrgLocation } from "@/components/launchpad/types";
import { Input } from "@/components/ui/input";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from "lucide-react";
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

interface LocationsModuleProps {
  locations: OrgLocation[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<OrgLocation>) => void;
  onRemove: (id: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export default function LocationsModule({
  locations,
  onAdd,
  onUpdate,
  onRemove,
  onSave,
  isSaving = false,
  readOnly = false,
}: LocationsModuleProps) {

  const [searchTerm, setSearchTerm] = React.useState("");

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = React.useState<Record<string, boolean>>({});

  // Scroll-aware header state
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Deletion confirmation dialog state
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    locationId?: string;
    locationName?: string;
  }>({ open: false });

  const toggleCardMinimize = (cardId: string) => {
    setMinimizedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const filteredLocations = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((loc, idx) => {
      const title = (loc.name?.trim() || `Location ${idx + 1}`).toLowerCase();
      return title.includes(term);
    });
  }, [locations, searchTerm]);

  const handleAddLocation = () => {
    // Ensure newly added card is visible even when a filter is active
    setSearchTerm("");
    onAdd();
    // Scroll to new card after a short delay to ensure it's rendered
    setTimeout(() => {
      const locationCards = document.querySelectorAll('[data-location-card]');
      const newCard = locationCards[locationCards.length - 1];
      newCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Deletion confirmation handlers
  const handleDeleteLocation = (locationId: string, locationName: string) => {
    setDeleteDialog({
      open: true,
      locationId,
      locationName
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.locationId) {
      onRemove(deleteDialog.locationId);
      setDeleteDialog({ open: false });
    }
  };

  // Scroll detection effect for header styling
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10); // Reduced trigger threshold for smoother animation
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Card className="border border-slate-200/80 bg-white shadow-sm rounded-2xl transition-shadow duration-200 hover:shadow-md">
      <CardHeader className={`sticky top-0 z-50 bg-[#1C275E] text-white border-b border-[#1C275E]/20 shadow-sm rounded-t-2xl transition-all duration-300 ${
        isScrolled
          ? 'p-1.5 shadow-lg shadow-black/10'
          : 'p-2 shadow-sm'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold tracking-tight">Practice Locations</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search locations..."
                aria-label="Search locations"
                className="h-8 w-[140px] sm:w-[180px] md:w-[220px] bg-white text-[#1C275E] placeholder:text-[#1C275E]/60 border-[#cbd5e1] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/20 pr-8 transition text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d9488]/40"
                  aria-label="Clear locations search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const documentsSection = document.getElementById('locations-documents');
                if (documentsSection) {
                  documentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-transparent text-[#e6eff7] border-[#95a3b8] hover:bg-[#233072] hover:text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2 h-8 px-3 text-sm"
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
              <Button variant="default" onClick={handleAddLocation} className="bg-[#f49024] hover:bg-[#d87f1f] text-white focus:ring-2 focus:ring-[#fef08a] focus:ring-offset-2 h-8 px-3 text-sm">Add Location</Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {locations.length === 0 && (
          <p className="text-sm text-muted-foreground">No locations added yet. Click "Add Location" to get started.</p>
        )}
        {locations.length > 0 && filteredLocations.length === 0 && (
          <p className="text-sm text-muted-foreground">No locations match your search.</p>
        )}
        {filteredLocations.map((loc) => {
          const originalIndex = locations.findIndex(l => l.id === loc.id);
          const cardId = `location-${loc.id}`;
          return (
            <div key={loc.id} style={{ scrollMarginTop: '80px' }}>
              <LocationCard
                location={loc}
                index={originalIndex >= 0 ? originalIndex : 0}
                onChange={(updates) => onUpdate(loc.id, updates)}
                onDelete={() => handleDeleteLocation(loc.id, loc.name || `Location ${originalIndex + 1}`)}
                isMinimized={minimizedCards[cardId]}
                onToggleMinimize={() => toggleCardMinimize(cardId)}
                readOnly={readOnly}
              />
            </div>
          );
        })}
      </CardContent>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.locationName}"?
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
    </Card>
  );
}


