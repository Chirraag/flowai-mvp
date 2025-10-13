/**
 * Shared change detection utilities for AI Agents
 * Extracted from scheduling agent patterns
 */

/**
 * Helper to normalize values for comparison (treat undefined as null)
 */
export const normalizeForComparison = <T>(value: T | null | undefined): T | null => {
  return value === undefined ? null : value;
};

/**
 * Deep change detection using JSON comparison
 * Used across all AI agent pages for determining if tabs have unsaved changes
 */
export const hasChanges = (newValues: any, currentValues: any): boolean => {
  try {
    return JSON.stringify(newValues) !== JSON.stringify(currentValues);
  } catch (error) {
    console.warn('Change detection failed:', error);
    return false;
  }
};

/**
 * Generate unsaved tabs list from change detection results
 */
export const getUnsavedTabsFromChanges = (
  changes: Record<string, boolean>,
  tabMapping: Record<string, string> = {}
): string[] => {
  return Object.entries(changes)
    .filter(([_, hasChange]) => hasChange)
    .map(([key]) => tabMapping[key] || key);
};

/**
 * Create a change detection function for a specific tab
 * Returns a memoized function that compares current vs original data
 */
export const createTabChangeDetector = <T>(
  getCurrentData: () => T,
  getOriginalData: () => T
) => {
  return (): boolean => {
    try {
      const current = getCurrentData();
      const original = getOriginalData();
      return hasChanges(current, original);
    } catch (error) {
      console.warn('Tab change detection failed:', error);
      return false;
    }
  };
};
