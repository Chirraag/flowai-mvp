import React, { lazy } from "react";
import { RouteObject } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getDefaultPageForRole, UserRole } from "@/lib/permissions";

// Lazy load components for better performance
const LaunchpadPage = lazy(() => import("@/pages/launchpad"));
const SchedulingAgent = lazy(() => import("@/pages/ai-agents/scheduling"));
const PatientIntakeAgent = lazy(
    () => import("@/pages/ai-agents/patient-intake"),
);
const CustomerSupportAgent = lazy(
    () => import("@/pages/ai-agents/customer-support"),
);
const AnalyticsAgent = lazy(() => import("@/pages/analytics/analytics"));
const MembersPage = lazy(() => import("@/pages/members"));
const LoginPage = lazy(() => import("@/pages/login"));
const LogoutPage = lazy(() => import("@/pages/logout"));
const NotFound = lazy(() => import("@/pages/not-found"));
const IntakePage = lazy(() => import("@/pages/intake"));

export const routes: RouteObject[] = [
    // Login route - accessible without authentication
    {
        path: "/login",
        element: React.createElement(LoginPage),
    },
    // Logout route - accessible without authentication
    {
        path: "/logout",
        element: React.createElement(LogoutPage),
    },
    // Public intake route - accessible without authentication
    {
        path: "/intake/:hash/*",
        element: React.createElement(IntakePage),
    },
    {
        path: "/:orgId",
        element: React.createElement(RootLayout),
        children: [
            // Default route for organization - redirect based on user role
            {
                path: "",
                element: React.createElement(() => {
                    React.useEffect(() => {
                        const orgId = window.location.pathname.split("/")[1];
                        if (orgId) {
                            // Get user role from token to determine default page
                            const token = localStorage.getItem("auth_token");
                            if (token) {
                                try {
                                    const payload = JSON.parse(atob(token.split(".")[1]));
                                    const userRole = payload.role as UserRole;
                                    const defaultPage = getDefaultPageForRole(userRole);
                                    window.location.href = `/${orgId}/${defaultPage}`;
                                } catch {
                                    // Fallback to launchpad if token parsing fails
                                    window.location.href = `/${orgId}/launchpad`;
                                }
                            } else {
                                // No token, redirect to login
                                window.location.href = "/login";
                            }
                        }
                    }, []);
                    return null;
                }),
            },
            // LAUNCHPAD
            {
                path: "launchpad",
                element: React.createElement(() => 
                    React.createElement(ProtectedRoute, { 
                        requiredPage: "launchpad",
                        children: React.createElement(LaunchpadPage)
                    })
                ),
            },
            // AI AGENTS
            {
                path: "ai-agents/scheduling",
                element: React.createElement(() => 
                    React.createElement(ProtectedRoute, { 
                        requiredPage: "ai-agents/scheduling",
                        children: React.createElement(SchedulingAgent)
                    })
                ),
            },
            {
                path: "ai-agents/patient-intake",
                element: React.createElement(() => 
                    React.createElement(ProtectedRoute, { 
                        requiredPage: "ai-agents/patient-intake",
                        children: React.createElement(PatientIntakeAgent)
                    })
                ),
            },
            {
                path: "ai-agents/customer-support",
                element: React.createElement(() => 
                    React.createElement(ProtectedRoute, { 
                        requiredPage: "ai-agents/customer-support",
                        children: React.createElement(CustomerSupportAgent)
                    })
                ),
            },
            {
                path: "analytics",
                element: React.createElement(() =>
                    React.createElement(ProtectedRoute, {
                        requiredPage: "analytics",
                        children: React.createElement(AnalyticsAgent)
                    })
                ),
            },
            // MEMBERS
            {
                path: "members",
                element: React.createElement(() => 
                    React.createElement(ProtectedRoute, { 
                        requiredPage: "members",
                        children: React.createElement(MembersPage)
                    })
                ),
            },
            // 404 handler
            {
                path: "*",
                element: React.createElement(NotFound),
            },
        ],
    },
    // Root redirect - redirect to login or user's organization with role-aware routing
    {
        path: "/",
        element: React.createElement(() => {
            React.useEffect(() => {
                // Check if user is authenticated
                const token = localStorage.getItem("auth_token");
                if (!token) {
                    window.location.href = "/login";
                    return;
                }

                // Try to get user's current org_id and role from token
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const orgId = payload.orgId;
                    const userRole = payload.role as UserRole;
                    
                    if (orgId && userRole) {
                        const defaultPage = getDefaultPageForRole(userRole);
                        window.location.href = `/${orgId}/${defaultPage}`;
                    } else {
                        window.location.href = "/login";
                    }
                } catch {
                    window.location.href = "/login";
                }
            }, []);
            return null;
        }),
    },
];
