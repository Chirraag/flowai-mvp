import express from 'express';
import authRoutes from './auth';
import adminRoutes from './admin';
import aiAgentsRoutes from './aiAgents';
import analyticsRoutes from './analytics';
import appointmentsRoutes from './appointments';
import patientsRoutes from './patients';
import askEvaRoutes from './askEva';
import emrRoutes from './emr';
import handoffRoutes from './handoff';
import humanAgentsRoutes from './humanAgents';
import integrationsRoutes from './integrations';
import workflowsRoutes from './workflows';
import businessWorkflowsRoutes from './businessWorkflows';

import auditDocumentsRoutes from './auditDocuments';
import { db } from '../../db/index';
import { patients, appointments, agentInteractions, aiAgents } from '@/db/schema';
import { populateDatabase } from '../../db/seedData';
import { sql, eq } from 'drizzle-orm';

const router = express.Router();

// Seed database endpoint
router.post('/seed/populate', async (req, res) => {
  try {
    await populateDatabase();
    
    // Get summary counts
    const [patientsCount] = await db.select({ count: sql`count(*)` }).from(patients);
    const [appointmentsCount] = await db.select({ count: sql`count(*)` }).from(appointments);
    const [interactionsCount] = await db.select({ count: sql`count(*)` }).from(agentInteractions);
    const [agentsCount] = await db.select({ count: sql`count(*)` }).from(aiAgents);
    
    res.json({
      success: true,
      message: "Database populated successfully",
      summary: {
        patients: Number(patientsCount.count),
        appointments: Number(appointmentsCount.count),
        agentInteractions: Number(interactionsCount.count),
        aiAgents: Number(agentsCount.count)
      }
    });
  } catch (error) {
    console.error("Error populating database:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to populate database",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Dashboard metrics endpoint
router.get('/seed/dashboard-metrics', async (req, res) => {
  try {
    // Get real counts from database
    const [patientsCount] = await db.select({ count: sql`count(*)` }).from(patients);
    const [appointmentsCount] = await db.select({ count: sql`count(*)` }).from(appointments);
    const [agentsCount] = await db.select({ count: sql`count(*)` }).from(aiAgents);
    
    // Get scheduled appointments (status = 'scheduled')
    const [scheduledAppointments] = await db.select({ count: sql`count(*)` })
      .from(appointments)
      .where(eq(appointments.status, 'scheduled'));
    
    // Calculate completion rate (completed appointments / total appointments)
    const [completedAppointments] = await db.select({ count: sql`count(*)` })
      .from(appointments)
      .where(eq(appointments.status, 'completed'));
    
    const completionRate = Number(appointmentsCount.count) > 0 
      ? Math.round((Number(completedAppointments.count) / Number(appointmentsCount.count)) * 100)
      : 0;
    
    // Get active agents (status = 'active')
    const [activeAgents] = await db.select({ count: sql`count(*)` })
      .from(aiAgents)
      .where(eq(aiAgents.status, 'active'));
    
    res.json({
      totalPatients: Number(patientsCount.count),
      scheduledAppointments: Number(scheduledAppointments.count),
      completionRate: completionRate,
      activeAgents: Number(activeAgents.count),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ 
      error: "Failed to fetch dashboard metrics",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Mount all other routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/ai-agents', aiAgentsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/patients', patientsRoutes);
router.use('/ask-eva', askEvaRoutes);
router.use('/emr', emrRoutes);
router.use('/handoff', handoffRoutes);
router.use('/human-agents', humanAgentsRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/workflows', workflowsRoutes);
router.use('/business-workflows', businessWorkflowsRoutes);
router.use('/audit-documents', auditDocumentsRoutes);

// V1 API info
router.get('/', (req, res) => {
  res.json({
    version: 'v1',
    description: 'FlowAI Healthcare API v1',
    endpoints: {
      appointments: '/api/v1/appointments',
      aiAgents: '/api/v1/ai-agents',
      auditDocuments: '/api/v1/audit-documents',
      patients: '/api/v1/patients',
      workflows: '/api/v1/workflows',
      businessWorkflows: '/api/v1/business-workflows',
      analytics: '/api/v1/analytics',
      integrations: '/api/v1/integrations',
      askEva: '/api/v1/ask-eva',
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      humanAgents: '/api/v1/human-agents',
      emr: '/api/v1/emr',
      handoff: '/api/v1/handoff'
    }
  });
});

export default router; 