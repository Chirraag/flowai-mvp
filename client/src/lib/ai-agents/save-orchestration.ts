/**
 * Shared save orchestration utilities for AI Agents
 * Handles save operations across multiple tabs with error handling
 */

export interface SaveTask {
  promise: Promise<any>;
  name: string;
  key: string;
}

export interface SaveResult {
  successful: string[];
  failed: string[];
  allSuccessful: boolean;
}

/**
 * Orchestrate multiple save operations with individual error handling
 * Returns results for each operation
 */
export const executeBulkSave = async (tasks: SaveTask[]): Promise<SaveResult> => {
  if (tasks.length === 0) {
    return {
      successful: [],
      failed: [],
      allSuccessful: true
    };
  }

  const results = await Promise.allSettled(tasks.map(task => task.promise));

  const successful: string[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    const task = tasks[index];
    if (result.status === 'fulfilled') {
      successful.push(task.name);
    } else {
      failed.push(task.name);
      console.error(`Failed to save ${task.name}:`, result.reason);
    }
  });

  return {
    successful,
    failed,
    allSuccessful: failed.length === 0
  };
};

/**
 * Create save tasks for tabs that have changes
 * Only includes tabs where change detection returns true
 */
export const createSaveTasks = (
  tabConfigs: Array<{
    key: string;
    name: string;
    apiFn: () => Promise<any>;
    hasChanges: boolean;
  }>
): SaveTask[] => {
  return tabConfigs
    .filter(config => config.hasChanges)
    .map(config => ({
      promise: config.apiFn(),
      name: config.name,
      key: config.key
    }));
};

/**
 * Generate user-friendly save result message
 */
export const generateSaveResultMessage = (result: SaveResult): string => {
  const { successful, failed, allSuccessful } = result;

  if (allSuccessful && successful.length > 0) {
    return `Successfully saved: ${successful.join(', ')}`;
  } else if (allSuccessful && successful.length === 0) {
    return 'No changes to save';
  } else if (successful.length > 0 && failed.length > 0) {
    return `Partially saved: ${successful.join(', ')}; Failed: ${failed.join(', ')}`;
  } else if (failed.length > 0) {
    return `Save failed: ${failed.join(', ')}`;
  }

  return 'Unknown save result';
};

/**
 * Determine toast variant based on save result
 */
export const getSaveResultVariant = (result: SaveResult): 'default' | 'destructive' => {
  return result.allSuccessful ? 'default' : 'destructive';
};
