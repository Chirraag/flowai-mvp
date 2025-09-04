import { useRoutes } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routes } from "./lib/routes";
import RootLayout from "./components/layout/RootLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginForm from "./components/auth/LoginForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Component to render routes with proper layout handling
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const element = useRoutes(routes);
  
  // Handle navigation after authentication state changes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProtectedRoute>
        {element}
      </ProtectedRoute>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
