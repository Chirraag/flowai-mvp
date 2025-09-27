import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredPage, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, canAccessPage } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will be handled by the main App component
  }

  // Check page-level permissions if requiredPage is specified
  if (requiredPage && !canAccessPage(requiredPage)) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to view this page. Contact your administrator if you need access.
            </p>
            <div className="text-sm text-gray-500">
              Required permission: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPage}</code>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}