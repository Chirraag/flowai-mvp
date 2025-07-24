import { useRoutes } from 'react-router-dom';
import { Suspense } from 'react';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import RootLayout from "./components/layout/RootLayout";
import { AppProvider } from "./context/AppContext";
import { NotificationProvider } from "./context/NotificationContext";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Component to render routes with proper layout handling
function AppRoutes() {
  const element = useRoutes(routes);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {element}
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
              <AppRoutes />
          </TooltipProvider>
        </NotificationProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
