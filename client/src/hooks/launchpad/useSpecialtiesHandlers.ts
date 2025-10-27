import { useCallback } from 'react';
import type { OrgSpecialityService } from '@/components/launchpad/types';

interface UseSpecialtiesHandlersProps {
  specialties: OrgSpecialityService[];
  dispatch: (action: any) => void;
}

export function useSpecialtiesHandlers({
  specialties,
  dispatch
}: UseSpecialtiesHandlersProps) {
  const handleAddSpecialty = useCallback(() => {
    dispatch({ type: 'SET_SPECIALTIES', payload: [...specialties, {
      id: Date.now().toString(),
      specialty_name: "",
      location_names_text: "",
      location_ids: [],
      physician_names_source_type: undefined,
      physician_names_source_name: undefined,
      physician_names_source_link: undefined,
      new_patients_source_type: undefined,
      new_patients_source_name: undefined,
      new_patients_source_link: undefined,
      physician_locations_source_type: undefined,
      physician_locations_source_name: undefined,
      physician_locations_source_link: undefined,
      physician_credentials_source_type: undefined,
      physician_credentials_source_name: undefined,
      physician_credentials_source_link: undefined,
      services: [],
      services_offered_source_type: undefined,
      services_offered_source_name: undefined,
      services_offered_source_link: undefined,
      patient_prep_source_type: undefined,
      patient_prep_source_name: undefined,
      patient_prep_source_link: undefined,
      patient_faqs_source_type: undefined,
      patient_faqs_source_name: undefined,
      patient_faqs_source_link: undefined,
      is_active: true,
    }] });
  }, [specialties, dispatch]);

  const handleUpdateSpecialty = useCallback((id: string, updates: Partial<OrgSpecialityService>) => {
    dispatch({ type: 'SET_SPECIALTIES', payload: specialties.map(s => s.id === id ? { ...s, ...updates } : s) });
  }, [specialties, dispatch]);

  const handleRemoveSpecialty = useCallback((id: string) => {
    dispatch({ type: 'SET_SPECIALTIES', payload: specialties.filter(s => s.id !== id) });
  }, [specialties, dispatch]);

  return {
    handleAddSpecialty,
    handleUpdateSpecialty,
    handleRemoveSpecialty,
  };
}
