import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import {
  canReadFeature,
  canWriteFeature,
  canAccessPage,
  UserRole,
  canAddMembers,
  canChangeRoles,
  canDeleteMembers,
  canCreateOrganizations
} from "@/lib/permissions";
import type { QueryFilters } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  org_id: number;
  org_name: string;
  workspaceId?: number;
  workspaceKey?: string;
  workspaceName?: string;
  is_active: boolean;
  last_login: string;
  force_password_reset: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  switchOrganization: (orgId: number) => Promise<void>;
  // RBAC Permission Methods
  hasReadAccess: (feature: string) => boolean;
  hasWriteAccess: (feature: string) => boolean;
  canAccessPage: (page: string) => boolean;
  isReadOnlyFor: (feature: string) => boolean;
  userRole?: UserRole;
  // Granular Launchpad permissions
  canEditLocations: boolean;
  canEditSpecialties: boolean;
  canEditInsurance: boolean;
  canEditAccountDetails: boolean;
  canEditKnowledgeBase: boolean;
  canAddTeamMember: boolean;
  // Granular AI Agents permissions
  canEditSchedulingAgent: boolean;
  canEditPatientIntakeAgent: boolean;
  canEditCustomerSupportAgent: boolean;
  // Member management permissions
  canAddMembers: () => boolean;
  canChangeRoles: () => boolean;
  canDeleteMembers: () => boolean;
  // Organization management permissions
  canCreateOrganizations: () => boolean;
  // Force password reset state
  forcePasswordReset: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const usePermissions = () => useAuth();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forcePasswordReset, setForcePasswordReset] = useState<boolean | null>(null);
  const prevOrgIdRef = useRef<number | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("AuthContext: Initializing auth...");
      const storedToken = localStorage.getItem("auth_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");
      console.log("AuthContext: Found tokens:", {
        hasToken: !!storedToken,
        hasRefreshToken: !!storedRefreshToken,
      });

      if (storedToken) {
        try {
          // Validate token with API
          const response = await fetch(
            "https://api.myflowai.com/auth/validate",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            const data = await response.json();
            console.log("Auth validation response:", data);
            if (data.valid && data.user) {
              console.log("Setting user from auth validation:", data.user);
              // Map API response to User interface
              const mappedUser: User = {
                id: data.user.userId,
                username: data.user.username,
                email: data.user.email,
                role: data.user.role,
                org_id: data.user.orgId, // Map orgId to org_id
                org_name: data.user.orgName,
                workspaceId: data.user.retellWorkspaceId
                  ? parseInt(
                      data.user.retellWorkspaceId.replace("org_", ""),
                      36,
                    )
                  : undefined,
                workspaceKey: data.user.orgKey,
                workspaceName: data.user.orgName,
                is_active: data.user.isActive,
                last_login: new Date().toISOString(), // API doesn't provide this
                force_password_reset: data.user.force_password_reset || false, // Default to false if not provided
              };
              console.log("Mapped user:", mappedUser);
              setToken(storedToken);
              setUser(mappedUser);
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
          console.error("AuthContext: Token validation failed:", error);
          // Try refresh token if available
          if (storedRefreshToken) {
            console.log("AuthContext: Attempting token refresh...");
            await refreshTokenInternal(storedRefreshToken);
          } else {
            console.log("AuthContext: No refresh token, clearing auth");
            clearAuth();
          }
        }
      } else {
        console.log("AuthContext: No stored token found");
      }

      console.log("AuthContext: Auth initialization complete");
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setForcePasswordReset(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    try {
      queryClient.clear();
    } catch {}
  };

  const refreshTokenInternal = async (refreshToken: string) => {
    console.log("AuthContext: Refreshing token...");
    try {
      const response = await fetch("https://api.myflowai.com/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AuthContext: Refresh response:", data);
        if (data.success && data.token) {
          setToken(data.token);
          localStorage.setItem("auth_token", data.token);

          if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
          }

          // Validate the new token to get user data
          const validateResponse = await fetch(
            "https://api.myflowai.com/auth/validate",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${data.token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (validateResponse.ok) {
            const validateData = await validateResponse.json();
            console.log("AuthContext: Validation after refresh:", validateData);
            if (validateData.valid && validateData.user) {
              console.log(
                "AuthContext: Setting user after refresh:",
                validateData.user,
              );
              // Map API response to User interface
              const mappedUser: User = {
                id: validateData.user.userId,
                username: validateData.user.username,
                email: validateData.user.email,
                role: validateData.user.role,
                org_id: validateData.user.orgId, // Map orgId to org_id
                org_name: validateData.user.orgName,
                workspaceId: validateData.user.retellWorkspaceId
                  ? parseInt(
                      validateData.user.retellWorkspaceId.replace("org_", ""),
                      36,
                    )
                  : undefined,
                workspaceKey: validateData.user.orgKey,
                workspaceName: validateData.user.orgName,
                is_active: validateData.user.isActive,
                last_login: new Date().toISOString(),
                force_password_reset: validateData.user.force_password_reset,
              };
              setUser(mappedUser);
            }
          }
        } else {
          console.log(
            "AuthContext: Refresh failed - no success/token in response",
          );
          clearAuth();
        }
      } else {
        console.log(
          "AuthContext: Refresh request failed with status:",
          response.status,
        );
        clearAuth();
      }
    } catch (error) {
      console.error("AuthContext: Token refresh failed:", error);
      clearAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("https://api.myflowai.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      if (data.success && data.token && data.user) {
        setToken(data.token);
        // Map API response to User interface
        const mappedUser: User = {
          id: data.user.userId,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          org_id: data.user.orgId, // Map orgId to org_id
          org_name: data.user.orgName,
          workspaceId: data.user.retellWorkspaceId
            ? parseInt(data.user.retellWorkspaceId.replace("org_", ""), 36)
            : undefined,
          workspaceKey: data.user.orgKey,
          workspaceName: data.user.orgName,
          is_active: data.user.isActive,
          last_login: new Date().toISOString(),
          force_password_reset: data.user.force_password_reset,
        };
        console.log("🔍 DEBUG: Mapped user object:", mappedUser);
        setUser(mappedUser);

        // Set force password reset state from login response
        setForcePasswordReset(data.user.force_password_reset);

        // Store tokens in localStorage
        localStorage.setItem("auth_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }

        // Only navigate if force_password_reset is not true
        // If it is true, let the LoginForm show the dialog first
        if (!data.user.force_password_reset) {
          window.location.href = "/";
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch("https://api.myflowai.com/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      clearAuth();
      // Navigate to login page after logout
      window.location.href = "/login";
    }
  };

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (storedRefreshToken) {
      await refreshTokenInternal(storedRefreshToken);
    }
  };

  const clearOrgScopedQueries = async () => {
    const orgQueryFilters: QueryFilters = {
      predicate: (query) => {
        const key = query.queryKey?.[0];
        return (
          key === "launchpad" ||
          key === "schedulingAgent" ||
          key === "documents" ||
          key === "knowledge"
        );
      },
    };

    try {
      await queryClient.cancelQueries(orgQueryFilters);
    } catch (error) {
      console.warn("Failed to cancel queries during org switch", error);
    }

    try {
      queryClient.removeQueries(orgQueryFilters);
    } catch (error) {
      console.warn("Failed to remove queries during org switch", error);
    }
  };

  const switchOrganization = async (orgId: number) => {
    try {
      await clearOrgScopedQueries();

      const response = await api.post("/auth/select-org", { orgId });

      if (response.success && response.token && response.user) {
        setToken(response.token);
        localStorage.setItem("auth_token", response.token);

        if (response.refreshToken) {
          localStorage.setItem("refresh_token", response.refreshToken);
        }

        const mappedUser: User = {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          role: response.user.role,
          org_id: response.user.org_id,
          org_name: response.user.org_name,
          workspaceId: response.user.org_id,
          workspaceName: response.user.org_name,
          is_active: response.user.is_active,
          last_login: new Date().toISOString(),
          force_password_reset: response.user.force_password_reset,
        };
        setUser(mappedUser);

        await clearOrgScopedQueries();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Organization switch failed:", error);
      throw error;
    }
  };

  const switchOrganizationLegacy = async (orgId: number) => {
    try {
      const response = await fetch("https://api.myflowai.com/auth/select-org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orgId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          // Update tokens
          setToken(data.token);
          localStorage.setItem("auth_token", data.token);

          if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
          }

          // Update user data with new organization
          if (data.user) {
            const mappedUser: User = {
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              role: data.user.role,
              org_id: data.user.org_id,
              org_name: data.user.org_name,
              workspaceId: data.user.org_id,
              workspaceName: data.user.org_name,
              is_active: data.user.is_active,
              last_login: new Date().toISOString(),
              force_password_reset: data.user.force_password_reset,
            };
            setUser(mappedUser);
          }
        }
      } else {
        throw new Error("Failed to switch organization");
      }
    } catch (error) {
      console.error("Organization switch failed:", error);
      throw error;
    }
  };

  // RBAC Permission Methods
  const userRole = user?.role as UserRole | undefined;

  const hasReadAccess = (feature: string) => {
    return !!(userRole && canReadFeature(userRole, feature as any));
  };

  const hasWriteAccess = (feature: string) => {
    return !!(userRole && canWriteFeature(userRole, feature as any));
  };

  const canAccess = (page: string) => {
    return !!(userRole && canAccessPage(userRole, page));
  };

  const isReadOnlyFor = (feature: string) => !hasWriteAccess(feature);

  const canAddMembersCheck = () => {
    return !!(userRole && canAddMembers(userRole));
  };

  const canChangeRolesCheck = () => {
    return !!(userRole && canChangeRoles(userRole));
  };

  const canDeleteMembersCheck = () => {
    return !!(userRole && canDeleteMembers(userRole));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshToken,
    switchOrganization,
    // RBAC Permission Methods
    hasReadAccess,
    hasWriteAccess,
    canAccessPage: canAccess,
    isReadOnlyFor,
    userRole,
    // Granular Launchpad permissions
    canEditLocations: hasWriteAccess("launchpad"),
    canEditSpecialties: hasWriteAccess("launchpad"),
    canEditInsurance: hasWriteAccess("launchpad"),
    canEditAccountDetails: hasWriteAccess("launchpad"),
    canEditKnowledgeBase: hasWriteAccess("launchpad"),
    canAddTeamMember: hasWriteAccess("launchpad"),
    // Granular AI Agents permissions
    canEditSchedulingAgent: hasWriteAccess("ai-agents"),
    canEditPatientIntakeAgent: hasWriteAccess("ai-agents"),
    canEditCustomerSupportAgent: hasWriteAccess("ai-agents"),
    // Member management permissions
    canAddMembers: canAddMembersCheck,
    canChangeRoles: canChangeRolesCheck,
    canDeleteMembers: canDeleteMembersCheck,
    // Organization management permissions
    canCreateOrganizations: () => !!(userRole && canCreateOrganizations(userRole)),
    // Force password reset state
    forcePasswordReset,
  };

  // Clear query cache when org switches to avoid cross-tenant leakage
  useEffect(() => {
    const currentOrgId = user?.org_id ?? null;
    if (
      prevOrgIdRef.current !== null &&
      currentOrgId !== prevOrgIdRef.current
    ) {
      try {
        queryClient.clear();
      } catch {}
    }
    prevOrgIdRef.current = currentOrgId;
  }, [user?.org_id]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
