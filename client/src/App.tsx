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

// Loading component for Suspense fallback (pulsing logo)
const LoadingLogo = () => (
  <div className="flex items-center justify-center min-h-screen">
    <img src="/logo.png" alt="Flow AI" className="w-40 h-auto animate-pulse" />
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
    return <LoadingLogo />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Suspense fallback={<LoadingLogo />}>
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
