import { useCallback } from 'react';
import type { Person } from '@/components/launchpad/types';

interface UseAccountPeopleHandlersProps {
  state: {
    decisionMakers: Person[];
    influencers: Person[];
    orderEntryTeam: Person[];
    schedulingTeam: Person[];
    patientIntakeTeam: Person[];
    rcmTeam: Person[];
  };
  dispatch: (action: any) => void;
}

type PersonType = 'decisionMakers' | 'influencers' | 'orderEntryTeam' | 'schedulingTeam' | 'patientIntakeTeam' | 'rcmTeam';

const getActionType = (personType: PersonType): string => {
  return personType === 'decisionMakers' ? 'SET_DECISION_MAKERS' :
         personType === 'influencers' ? 'SET_INFLUENCERS' :
         personType === 'orderEntryTeam' ? 'SET_ORDER_ENTRY_TEAM' :
         personType === 'schedulingTeam' ? 'SET_SCHEDULING_TEAM' :
         personType === 'patientIntakeTeam' ? 'SET_PATIENT_INTAKE_TEAM' :
         'SET_RCM_TEAM';
};

export function useAccountPeopleHandlers({
  state,
  dispatch
}: UseAccountPeopleHandlersProps) {
  const addPerson = useCallback((personType: PersonType) => {
    dispatch({
      type: getActionType(personType),
      payload: [...state[personType], { id: Date.now().toString(), title: "", name: "", email: "", phone: "" }]
    });
  }, [state, dispatch]);

  const updatePerson = useCallback((
    personType: PersonType,
    id: string,
    field: keyof Person,
    value: string
  ) => {
    dispatch({
      type: getActionType(personType),
      payload: state[personType].map(p => (p.id === id ? { ...p, [field]: value } : p))
    });
  }, [state, dispatch]);

  const removePerson = useCallback((
    personType: PersonType,
    id: string
  ) => {
    dispatch({
      type: getActionType(personType),
      payload: state[personType].filter(p => p.id !== id)
    });
  }, [state, dispatch]);

  const handleDeletePerson = useCallback((
    personType: PersonType,
    id: string,
    personName: string
  ) => {
    dispatch({
      type: 'SET_DELETE_DIALOG',
      payload: {
        open: true,
        personId: id,
        personName,
        setter: personType
      }
    });
  }, [dispatch]);

  return {
    addPerson,
    updatePerson,
    removePerson,
    handleDeletePerson,
  };
}
