import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  workspace_id: number;
  workspace_name: string;
  is_active: boolean;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken) {
        try {
          // Validate token with API
          const response = await fetch('https://api.myflowai.com/auth/validate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid && data.user) {
              setToken(storedToken);
              setUser(data.user);
            } else {
              // Token invalid, try refresh
              if (storedRefreshToken) {
                await refreshTokenInternal(storedRefreshToken);
              } else {
                clearAuth();
              }
            }
          } else {
            // Token invalid, try refresh
            if (storedRefreshToken) {
              await refreshTokenInternal(storedRefreshToken);
            } else {
              clearAuth();
            }
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Try refresh token if available
          if (storedRefreshToken) {
            await refreshTokenInternal(storedRefreshToken);
          } else {
            clearAuth();
          }
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  };

  const refreshTokenInternal = async (refreshToken: string) => {
    try {
      const response = await fetch('https://api.myflowai.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
          
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }

          // Validate the new token to get user data
          const validateResponse = await fetch('https://api.myflowai.com/auth/validate', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });

          if (validateResponse.ok) {
            const validateData = await validateResponse.json();
            if (validateData.valid && validateData.user) {
              setUser(validateData.user);
            }
          }
        } else {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://api.myflowai.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        
        // Store tokens in localStorage
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        
        // Navigate to dashboard after successful login
        window.location.href = '/';
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('https://api.myflowai.com/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAuth();
      // Navigate to login page after logout
      window.location.href = '/login';
    }
  };

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (storedRefreshToken) {
      await refreshTokenInternal(storedRefreshToken);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};