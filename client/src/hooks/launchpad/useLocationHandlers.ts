import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { OrgLocation, OrgSpecialityService } from '@/components/launchpad/types';

interface UseLocationHandlersProps {
  unsavedLocations: OrgLocation[];
  savedLocations: OrgLocation[];
  specialties: OrgSpecialityService[];
  dispatch: (action: any) => void;
  validateLocationDeletion: (locationId: string, locationName: string, specialties: OrgSpecialityService[]) => { affectedSpecialties: string[] };
}

export function useLocationHandlers({
  unsavedLocations,
  savedLocations,
  specialties,
  dispatch,
  validateLocationDeletion
}: UseLocationHandlersProps) {
  const handleAddLocation = useCallback(() => {
    const newLocation = {
      id: Date.now().toString(),
      location_id: "",
      name: "",
      address_line1: "",
      address_line2: null,
      city: "",
      state: "",
      zip_code: "",
      weekday_hours: "09:00 - 17:00",
      weekend_hours: "",
      specialties_text: "",
      services_text: "",
      parking_directions: "",
      is_active: true,
      _isUnsaved: true,
    };
    dispatch({ type: 'SET_UNSAVED_LOCATIONS', payload: [...unsavedLocations, newLocation] });
  }, [unsavedLocations, dispatch]);

  const handleUpdateLocation = useCallback((id: string, updates: Partial<OrgLocation>) => {
    // Check if it's an unsaved location first
    dispatch({
      type: 'SET_UNSAVED_LOCATIONS',
      payload: unsavedLocations.map(l => l.id === id ? { ...l, ...updates } : l)
    });

    // Also update saved locations if it exists there
    dispatch({
      type: 'SET_SAVED_LOCATIONS',
      payload: savedLocations.map(l => l.id === id ? { ...l, ...updates } : l)
    });
  }, [unsavedLocations, savedLocations, dispatch]);

  const handleRemoveLocation = useCallback((id: string) => {
    // Find the location being deleted
    const locationToDelete = [...savedLocations, ...unsavedLocations].find(loc => loc.id === id);
    if (!locationToDelete) return;

    // Check if any specialties use this location
    const validation = validateLocationDeletion(
      locationToDelete.location_id,
      locationToDelete.name,
      specialties
    );

    if (validation.affectedSpecialties.length > 0) {
      // Show warning and automatically remove location from specialties
      const updatedSpecialties = specialties.map(spec => ({
        ...spec,
        location_ids: spec.location_ids.filter(locId => locId !== locationToDelete.location_id)
      }));

      dispatch({ type: 'SET_SPECIALTIES', payload: updatedSpecialties });

      // Show toast notification
      toast({
        title: "Location Removed from Specialties",
        description: `Location "${locationToDelete.name}" was automatically removed from ${validation.affectedSpecialties.length} specialty(ies): ${validation.affectedSpecialties.join(', ')}`,
        variant: "default",
      });
    }

    // Remove the location
    dispatch({ type: 'SET_UNSAVED_LOCATIONS', payload: unsavedLocations.filter(l => l.id !== id) });
    dispatch({ type: 'SET_SAVED_LOCATIONS', payload: savedLocations.filter(l => l.id !== id) });
  }, [savedLocations, unsavedLocations, specialties, validateLocationDeletion, dispatch]);

  return {
    handleAddLocation,
    handleUpdateLocation,
    handleRemoveLocation,
  };
}
