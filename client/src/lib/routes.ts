import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';

// Lazy load components for better performance
const BusinessWorkflows = lazy(() => import('@/pages/business-workflows'));
const BusinessWorkflowEditor = lazy(() => import('@/pages/business-workflows/editor'));
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
            // Default route - redirect to workflows
            {
                path: '/',
                element: React.createElement(() => {
                    React.useEffect(() => {
                        window.location.href = '/business-workflows';
                    }, []);
                    return null;
                }),
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
