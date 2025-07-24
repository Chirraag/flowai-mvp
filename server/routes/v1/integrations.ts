import express from 'express';

const router = express.Router();

// Get active EMR connections
router.get('/emr-connections/active', async (req, res) => {
  try {
    // Mock athenahealth connection with HIPAA-compliant masked credentials
    const activeConnection = {
      connectionId: 1,
      systemName: "athenahealth",
      systemType: "EMR",
      status: "connected",
      healthScore: 96,
      endpoint: "https://api.athenahealth.com/v1",
      authMethod: "OAuth 2.0 (2-legged & 3-legged)",
      lastSyncAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      lastHealthCheckAt: new Date().toISOString(),
      isActive: true,
      credentials: {
        clientId: "athena_client_••••••••",
        clientSecret: "••••••••••••••••••••",
        apiKey: "athena_api_••••••••••••••••",
        endpoint: "https://api.athenahealth.com/v1",
        practiceId: "195900",
        environment: "preview"
      },
      apis: [
        {
          apiId: 1,
          apiName: "Patient API",
          apiFunction: "Access patient demographics and medical records",
          status: "active",
          averageLatency: 142,
          errorRate: 0.2,
          callsLast24h: 3124,
          lastCallAt: new Date(Date.now() - 2 * 60 * 1000).toISOString()
        },
        {
          apiId: 2,
          apiName: "Appointment API",
          apiFunction: "Schedule and manage patient appointments",
          status: "active",
          averageLatency: 118,
          errorRate: 0.1,
          callsLast24h: 2567,
          lastCallAt: new Date(Date.now() - 1 * 60 * 1000).toISOString()
        }
      ],
      stats: {
        appointments: 523,
        patients: 1456,
        orders: 892,
        results: 234
      }
    };
    
    res.json(activeConnection);
  } catch (error) {
    console.error("Error fetching active EMR connection:", error);
    res.status(500).json({ error: "Failed to fetch active EMR connection" });
  }
});

// Sync EMR connection
router.post('/emr-connections/:connectionId/sync', async (req, res) => {
  try {
    const { connectionId } = req.params;
    console.log(`Syncing EMR connection ${connectionId}`);
    
    // Simulate sync process
    setTimeout(() => {
      console.log(`Sync completed for connection ${connectionId}`);
    }, 2000);
    
    res.json({ 
      message: 'Sync initiated', 
      syncId: Math.floor(Math.random() * 10000),
      status: 'in_progress'
    });
  } catch (error) {
    console.error("Error initiating EMR sync:", error);
    res.status(500).json({ error: "Failed to initiate EMR sync" });
  }
});

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const integrations = [
      {
        id: 1,
        name: "athenahealth EMR",
        type: "EMR",
        status: "connected",
        healthScore: 96,
        lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: "Redox Integration",
        type: "Data Exchange",
        status: "connected",
        healthScore: 94,
        lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: "Boomi Platform",
        type: "Integration Platform",
        status: "connected",
        healthScore: 98,
        lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      }
    ];
    
    res.json(integrations);
  } catch (error) {
    console.error("Error fetching integrations:", error);
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
});

export default router; 