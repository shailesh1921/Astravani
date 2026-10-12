import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from './AuthCard';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading, loginUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-xs text-slate-500 font-medium">Authenticating secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <AuthCard onSuccess={loginUser} />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
