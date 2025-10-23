import { useCallback } from 'react';
import type { Person } from '@/components/launchpad/types';

type PersonType = 'decisionMakers' | 'influencers' | 'orderEntryTeam' | 'schedulingTeam' | 'patientIntakeTeam' | 'rcmTeam';

const getActionType = (personType: PersonType): string => {
  return personType === 'decisionMakers' ? 'SET_DECISION_MAKERS' :
         personType === 'influencers' ? 'SET_INFLUENCERS' :
         personType === 'orderEntryTeam' ? 'SET_ORDER_ENTRY_TEAM' :
         personType === 'schedulingTeam' ? 'SET_SCHEDULING_TEAM' :
         personType === 'patientIntakeTeam' ? 'SET_PATIENT_INTAKE_TEAM' :
         'SET_RCM_TEAM';
};

export function usePeopleManagement(
  personType: PersonType,
  people: Person[],
  dispatch: (action: any) => void
) {
  const add = useCallback(() => {
    dispatch({
      type: getActionType(personType),
      payload: [...people, { id: Date.now().toString(), title: "", name: "", email: "", phone: "" }]
    });
  }, [personType, people, dispatch]);

  const update = useCallback((
    id: string,
    field: keyof Person,
    value: string
  ) => {
    dispatch({
      type: getActionType(personType),
      payload: people.map(p => (p.id === id ? { ...p, [field]: value } : p))
    });
  }, [personType, people, dispatch]);

  const remove = useCallback((id: string) => {
    dispatch({
      type: getActionType(personType),
      payload: people.filter(p => p.id !== id)
    });
  }, [personType, people, dispatch]);

  return {
    add,
    update,
    remove,
  };
}
