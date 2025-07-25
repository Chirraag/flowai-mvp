import React, { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';

// Lazy load components for better performance
const AboutUs = lazy(() => import('@/pages/about-us'));
const Analytics = lazy(() => import('@/pages/analytics'));
const BusinessWorkflows = lazy(() => import('@/pages/business-workflows'));
const BusinessWorkflowEditor = lazy(() => import('@/pages/business-workflows/editor'));
const AIAgents = lazy(() => import('@/pages/ai-agents'));
const AgentDetail = lazy(() => import('@/pages/ai-agents/agent-detail'));
const PatientIntakeAgentConfig = lazy(() => import('@/pages/ai-agents/patient-intake-agent-config'));
const SchedulingAgentConfig = lazy(() => import('@/pages/ai-agents/scheduling-agent-config'));
const EMR = lazy(() => import('@/pages/emr'));
const RIS = lazy(() => import('@/pages/ris'));
const Audits = lazy(() => import('@/pages/audits'));
const Privacy = lazy(() => import('@/pages/privacy'));
const Security = lazy(() => import('@/pages/security'));
const ContactCenterIntegration = lazy(() => import('@/pages/contact-center-integration'));
const HumanAI = lazy(() => import('@/pages/human-ai'));
const AskEva = lazy(() => import('@/pages/ask-eva'));
const NotificationsPage = lazy(() => import('@/pages/notifications'));
const NotFound = lazy(() => import('@/pages/not-found'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: React.createElement(RootLayout),
        children: [
            // MAIN
            {
                path: '/business-workflows',
                element: React.createElement(BusinessWorkflows),
            },
            {
                path: '/business-workflows/editor/:workflowId',
                element: React.createElement(BusinessWorkflowEditor),
            },
            {
                path: '/ai-agents',
                element: React.createElement(AIAgents),
            },
            {
                path: '/ai-agents/:agentId',
                element: React.createElement(AgentDetail),
            },
            {
                path: '/ai-agents/patient-intake-agent-config',
                element: React.createElement(PatientIntakeAgentConfig),
            },
            {
                path: '/ai-agents/scheduling-agent-config',
                element: React.createElement(SchedulingAgentConfig),
            },
            {
                path: '/analytics',
                element: React.createElement(Analytics),
            },
            // HEALTH SYSTEMS
            {
                path: '/emr',
                element: React.createElement(EMR),
            },
            {
                path: '/ris',
                element: React.createElement(RIS),
            },
            // COMPLIANCE
            {
                path: '/audits',
                element: React.createElement(Audits),
            },
            {
                path: '/privacy',
                element: React.createElement(Privacy),
            },
            {
                path: '/security',
                element: React.createElement(Security),
            },
            // CONTACT CENTER
            {
                path: '/contact-center-integration',
                element: React.createElement(ContactCenterIntegration),
            },
            {
                path: '/human-ai',
                element: React.createElement(HumanAI),
            },
            // ABOUT US
            {
                path: '/',
                element: React.createElement(AboutUs),
            },
            {
                path: '/about-us',
                element: React.createElement(AboutUs),
            },
            {
                path: '/ask-eva',
                element: React.createElement(AskEva),
            },
            // Utility pages
            {
                path: '/notifications',
                element: React.createElement(NotificationsPage),
            },
            // 404 handler - now included within RootLayout
            {
                path: '*',
                element: React.createElement(NotFound),
            }
        ]
    }
];
