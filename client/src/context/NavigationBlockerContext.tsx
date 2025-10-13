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

interface NavigationBlockerContextType {
  hasUnsavedChanges: boolean;
  unsavedTabs: string[];
  setHasUnsavedChanges: (value: boolean) => void;
  setUnsavedTabs: (tabs: string[]) => void;
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
    setHasUnsavedChanges,
    setUnsavedTabs,
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
