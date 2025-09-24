import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/launchpad/locations/LocationCard";
import { OrgLocation } from "@/components/launchpad/types";
import { Input } from "@/components/ui/input";
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

interface LocationsModuleProps {
  locations: OrgLocation[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<OrgLocation>) => void;
  onRemove: (id: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function LocationsModule({
  locations,
  onAdd,
  onUpdate,
  onRemove,
  onSave,
  isSaving = false,
}: LocationsModuleProps) {

  const [searchTerm, setSearchTerm] = React.useState("");

  // Minimize state for cards
  const [minimizedCards, setMinimizedCards] = React.useState<Record<string, boolean>>({});

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
  return (
    <Card className="border-0 shadow-lg bg-white rounded-xl">
      <CardHeader className="sticky top-0 z-50 bg-[#1C275E] text-white p-3 border-b border-[#1C275E]/20 shadow-sm rounded-t-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F48024]/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-[#F48024]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold">Practice Locations</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search locations..."
              aria-label="Search locations"
              className="h-8 w-[160px] sm:w-[220px] md:w-[280px] bg-white text-[#1C275E] placeholder:text-[#1C275E]/60"
            />
            <Button
              variant="outline"
              onClick={() => {
                const documentsSection = document.getElementById('locations-documents');
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
            <Button variant="default" onClick={handleAddLocation} className="bg-[#F48024] hover:bg-[#F48024]/90 text-white">Add Location</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
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


