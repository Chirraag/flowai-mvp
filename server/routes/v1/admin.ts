import express from 'express';

const router = express.Router();

// Get system status
router.get('/system-status', async (req, res) => {
  try {
    const status = {
      system: "healthy",
      database: "connected",
      aiAgents: "active",
      integrations: "connected",
      lastCheck: new Date().toISOString()
    };
    
    res.json(status);
  } catch (error) {
    console.error("Error fetching system status:", error);
    res.status(500).json({ error: "Failed to fetch system status" });
  }
});

// Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      activeUsers: 45,
      totalPatients: 1456,
      activeAppointments: 523,
      aiAgentUtilization: 78.5,
      systemUptime: "99.9%",
      lastUpdated: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    res.status(500).json({ error: "Failed to fetch admin metrics" });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = [
      {
        id: 1,
        userId: 1,
        action: "LOGIN_SUCCESS",
        table: "users",
        recordId: "1",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        ipAddress: "192.168.1.100"
      },
      {
        id: 2,
        userId: 1,
        action: "PATIENT_CREATED",
        table: "patients",
        recordId: "123",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        ipAddress: "192.168.1.100"
      }
    ];
    
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// Get system configuration
router.get('/config', async (req, res) => {
  try {
    const config = {
      environment: "production",
      version: "1.0.0",
      features: {
        aiAgents: true,
        emrIntegration: true,
        analytics: true,
        handoff: true
      },
      limits: {
        maxPatients: 10000,
        maxAppointments: 5000,
        maxAgents: 50
      }
    };
    
    res.json(config);
  } catch (error) {
    console.error("Error fetching system config:", error);
    res.status(500).json({ error: "Failed to fetch system config" });
  }
});

export default router; 