import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <img
          src="/logo_flowai.png"
          alt="Flow AI"
          className="h-12 w-auto mx-auto mb-4 animate-pulse"
        />
        <p className="text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}
