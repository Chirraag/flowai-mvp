import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

interface BackgroundTask {
  id: string;
  type: 'knowledge-base-generation';
  status: 'running' | 'completed' | 'failed';
  message: string;
  startedAt: number;
  completedAt?: number;
}

interface NavigationBlockerContextType {
  hasUnsavedChanges: boolean;
  unsavedTabs: string[];
  backgroundTasks: BackgroundTask[];
  setHasUnsavedChanges: (value: boolean) => void;
  setUnsavedTabs: (tabs: string[]) => void;
  addBackgroundTask: (task: Omit<BackgroundTask, 'startedAt'>) => void;
  updateBackgroundTask: (id: string, updates: Partial<BackgroundTask>) => void;
  removeBackgroundTask: (id: string) => void;
  attemptNavigation: (to: string) => void;
  navigateWithoutBlock: (to: string) => void;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType | undefined>(undefined);

export const useNavigationBlocker = () => {
  const context = useContext(NavigationBlockerContext);
  if (context === undefined) {
    throw new Error('useNavigationBlocker must be used within a NavigationBlockerProvider');
  }
  return context;
};

interface NavigationBlockerProviderProps {
  children: React.ReactNode;
}

export const NavigationBlockerProvider: React.FC<NavigationBlockerProviderProps> = ({ children }) => {
  const [hasUnsavedChanges, setHasUnsavedChangesState] = useState(false);
  const [unsavedTabs, setUnsavedTabsState] = useState<string[]>([]);
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Ref to track if we should ignore the next popstate event
  const ignoreNextPopstate = useRef(false);

  const setHasUnsavedChanges = useCallback((value: boolean) => {
    console.log('NavigationBlocker - setHasUnsavedChanges called with:', value);
    setHasUnsavedChangesState(value);
  }, []);

  const setUnsavedTabs = useCallback((tabs: string[]) => {
    console.log('NavigationBlocker - setUnsavedTabs called with:', tabs);
    setUnsavedTabsState(tabs);
  }, []);

  const addBackgroundTask = useCallback((task: Omit<BackgroundTask, 'startedAt'>) => {
    console.log('NavigationBlocker - addBackgroundTask called with:', task);
    setBackgroundTasks(prev => [...prev, { ...task, startedAt: Date.now() }]);
  }, []);

  const updateBackgroundTask = useCallback((id: string, updates: Partial<BackgroundTask>) => {
    console.log('NavigationBlocker - updateBackgroundTask called with:', id, updates);
    setBackgroundTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const removeBackgroundTask = useCallback((id: string) => {
    console.log('NavigationBlocker - removeBackgroundTask called with:', id);
    setBackgroundTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Function to attempt navigation - called by navigation components
  const attemptNavigation = useCallback((to: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(to);
      setShowDialog(true);
    } else {
      navigate(to);
    }
  }, [hasUnsavedChanges, navigate]);

  // Function to navigate without checking for unsaved changes
  const navigateWithoutBlock = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (ignoreNextPopstate.current) {
        ignoreNextPopstate.current = false;
        return;
      }

      if (hasUnsavedChanges) {
        // Prevent the navigation by pushing the current state back
        window.history.pushState(null, '', location.pathname + location.search);
        setPendingNavigation(window.location.pathname + window.location.search);
        setShowDialog(true);
        event.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location]);

  // Handle browser reload/close navigation for background tasks
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasRunningTasks = backgroundTasks.some(task => task.status === 'running');

      if (hasRunningTasks) {
        event.preventDefault();
        event.returnValue = 'Knowledge base generation in progress. Leaving will not stop the generation, but you will need to return to see results.';
        return event.returnValue;
      }

      // Also check for unsaved changes (maintains existing behavior)
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [backgroundTasks, hasUnsavedChanges]);

  const handleContinueAnyway = () => {
    setShowDialog(false);
    if (pendingNavigation) {
      // For browser navigation, we need to ignore the next popstate
      if (pendingNavigation !== location.pathname + location.search) {
        ignoreNextPopstate.current = true;
      }
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
    // Clear unsaved changes state
    setHasUnsavedChangesState(false);
    setUnsavedTabsState([]);
  };

  const handleStayOnPage = () => {
    setShowDialog(false);
    setPendingNavigation(null);
  };

  const value = {
    hasUnsavedChanges,
    unsavedTabs,
    backgroundTasks,
    setHasUnsavedChanges,
    setUnsavedTabs,
    addBackgroundTask,
    updateBackgroundTask,
    removeBackgroundTask,
    attemptNavigation,
    navigateWithoutBlock,
  };

  return (
    <NavigationBlockerContext.Provider value={value}>
      {children}

      {/* Navigation Blocker Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
                Unsaved changes in {unsavedTabs.length === 1 ? 'tab' : 'tabs'}: <strong>{unsavedTabs.join(", ")}</strong>. Please save your changes before leaving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleStayOnPage}>
              Stay on Current Page
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleContinueAnyway}
              className="bg-[#1C275E] hover:bg-[#233072]"
            >
              Leave Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NavigationBlockerContext.Provider>
  );
};