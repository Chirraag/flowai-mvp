/**
 * Shared state management utilities for AI Agents
 * Common patterns for loading, saving, and dirty state management
 */

export interface LoadingState {
  isLoading: boolean;
  isSaving: boolean;
  savingTabs: Set<string>;
  dirtyTabs: Set<string>;
  retryCount: number;
}

/**
 * Create initial loading state for AI agent pages
 */
export const createInitialState = (): LoadingState => ({
  isLoading: true,
  isSaving: false,
  savingTabs: new Set(),
  dirtyTabs: new Set(),
  retryCount: 0
});

/**
 * State update helpers
 */
export const stateHelpers = {
  setLoading: (state: LoadingState, isLoading: boolean): LoadingState => ({
    ...state,
    isLoading
  }),

  setSaving: (state: LoadingState, isSaving: boolean): LoadingState => ({
    ...state,
    isSaving
  }),

  addSavingTab: (state: LoadingState, tabKey: string): LoadingState => ({
    ...state,
    savingTabs: new Set([...Array.from(state.savingTabs), tabKey])
  }),

  clearSavingTabs: (state: LoadingState): LoadingState => ({
    ...state,
    savingTabs: new Set()
  }),

  addDirtyTab: (state: LoadingState, tabKey: string): LoadingState => ({
    ...state,
    dirtyTabs: new Set([...Array.from(state.dirtyTabs), tabKey])
  }),

  removeDirtyTab: (state: LoadingState, tabKey: string): LoadingState => {
    const newDirtyTabs = new Set(state.dirtyTabs);
    newDirtyTabs.delete(tabKey);
    return {
      ...state,
      dirtyTabs: newDirtyTabs
    };
  },

  clearDirtyTabs: (state: LoadingState): LoadingState => ({
    ...state,
    dirtyTabs: new Set()
  }),

  incrementRetryCount: (state: LoadingState): LoadingState => ({
    ...state,
    retryCount: state.retryCount + 1
  }),

  resetRetryCount: (state: LoadingState): LoadingState => ({
    ...state,
    retryCount: 0
  })
};

/**
 * Check if any tabs have unsaved changes
 */
export const hasUnsavedChanges = (state: LoadingState): boolean => {
  return state.dirtyTabs.size > 0;
};

/**
 * Get list of tabs with unsaved changes
 */
export const getUnsavedTabNames = (
  state: LoadingState,
  tabMapping: Record<string, string> = {}
): string[] => {
  return Array.from(state.dirtyTabs).map(key => tabMapping[key] || key);
};

/**
 * Check if a specific tab is currently saving
 */
export const isTabSaving = (state: LoadingState, tabKey: string): boolean => {
  return state.savingTabs.has(tabKey);
};

/**
 * Check if a specific tab has unsaved changes
 */
export const isTabDirty = (state: LoadingState, tabKey: string): boolean => {
  return state.dirtyTabs.has(tabKey);
};
