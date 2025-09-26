import React, { lazy } from "react";
import { RouteObject } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";

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
const NotFound = lazy(() => import("@/pages/not-found"));

export const routes: RouteObject[] = [
    // Login route - accessible without authentication
    {
        path: "/login",
        element: React.createElement(LoginPage),
    },
    {
        path: "/:orgId",
        element: React.createElement(RootLayout),
        children: [
            // Default route for organization - redirect to launchpad
            {
                path: "",
                element: React.createElement(() => {
                    React.useEffect(() => {
                        const orgId = window.location.pathname.split("/")[1];
                        if (orgId) {
                            window.location.href = `/${orgId}/launchpad`;
                        }
                    }, []);
                    return null;
                }),
            },
            // LAUNCHPAD
            {
                path: "launchpad",
                element: React.createElement(LaunchpadPage),
            },
            // AI AGENTS
            {
                path: "ai-agents/scheduling",
                element: React.createElement(SchedulingAgent),
            },
            {
                path: "ai-agents/patient-intake",
                element: React.createElement(PatientIntakeAgent),
            },
            {
                path: "ai-agents/customer-support",
                element: React.createElement(CustomerSupportAgent),
            },
            {
                path: "analytics",
                element: React.createElement(AnalyticsAgent),
            },
            // MEMBERS
            {
                path: "members",
                element: React.createElement(MembersPage),
            },
            // 404 handler
            {
                path: "*",
                element: React.createElement(NotFound),
            },
        ],
    },
    // Root redirect - redirect to login or user's organization
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

                // Try to get user's current org_id from token or localStorage
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    const orgId = payload.orgId;
                    if (orgId) {
                        window.location.href = `/${orgId}/launchpad`;
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
