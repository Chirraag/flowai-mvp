import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';

// Lazy load components for better performance
const LaunchpadPage = lazy(() => import('@/pages/launchpad/launchpad'));
const BusinessWorkflows = lazy(() => import('@/pages/business-workflows'));
const BusinessWorkflowEditor = lazy(() => import('@/pages/business-workflows/editor'));
const SchedulingAgent = lazy(() => import('@/pages/ai-agents/scheduling'));
const PatientIntakeAgent = lazy(() => import('@/pages/ai-agents/patient-intake'));
const CustomerSupportAgent = lazy(() => import('@/pages/ai-agents/customer-support'));
const KnowledgeAgent = lazy(() => import('@/pages/knowledge/knowledge'));
const AnalyticsAgent = lazy(() => import('@/pages/analytics/analytics'));
const LoginPage = lazy(() => import('@/pages/login'));
const NotFound = lazy(() => import('@/pages/not-found'));

export const routes: RouteObject[] = [
    // Login route - accessible without authentication
    {
        path: '/login',
        element: React.createElement(LoginPage),
    },
    {
        path: '/',
        element: React.createElement(RootLayout),
        children: [
            // Default route - redirect to launchpad
            {
                path: '/',
                element: React.createElement(() => {
                    React.useEffect(() => {
                        window.location.href = '/launchpad';
                    }, []);
                    return null;
                }),
            },
            // LAUNCHPAD
            {
                path: '/launchpad',
                element: React.createElement(LaunchpadPage),
            },
            // AI AGENTS
            {
                path: '/ai-agents/scheduling',
                element: React.createElement(SchedulingAgent),
            },
            {
                path: '/ai-agents/patient-intake',
                element: React.createElement(PatientIntakeAgent),
            },
            {
                path: '/ai-agents/customer-support',
                element: React.createElement(CustomerSupportAgent),
            },
            {
                path: '/ai-agents/knowledge',
                element: React.createElement(KnowledgeAgent),
            },
            {
                path: '/ai-agents/analytics',
                element: React.createElement(AnalyticsAgent),
            },
            // WORKFLOWS
            {
                path: '/business-workflows',
                element: React.createElement(BusinessWorkflows),
            },
            {
                path: '/business-workflows/editor/:workflowId',
                element: React.createElement(BusinessWorkflowEditor),
            },
            // 404 handler
            {
                path: '*',
                element: React.createElement(NotFound),
            }
        ]
    }
];
