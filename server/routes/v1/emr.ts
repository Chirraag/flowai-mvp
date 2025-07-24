import express from 'express';

const router = express.Router();

// Get EMR connections
router.get('/connections', async (req, res) => {
  try {
    const connections = [
      {
        id: 1,
        name: "athenahealth",
        type: "EMR",
        status: "connected",
        healthScore: 96,
        lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        endpoint: "https://api.athenahealth.com/v1"
      },
      {
        id: 2,
        name: "Epic",
        type: "EMR",
        status: "disconnected",
        healthScore: 0,
        lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endpoint: "https://api.epic.com/v1"
      }
    ];
    
    res.json(connections);
  } catch (error) {
    console.error("Error fetching EMR connections:", error);
    res.status(500).json({ error: "Failed to fetch EMR connections" });
  }
});

// Get EMR connection by ID
router.get('/connections/:id', async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    
    const connection = {
      id: connectionId,
      name: "athenahealth",
      type: "EMR",
      status: "connected",
      healthScore: 96,
      endpoint: "https://api.athenahealth.com/v1",
      lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      configuration: {
        apiVersion: "v1",
        authMethod: "OAuth 2.0",
        timeout: 30000,
        retryAttempts: 3
      },
      apis: [
        {
          name: "Patient API",
          status: "active",
          lastCall: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          avgLatency: 142
        },
        {
          name: "Appointment API",
          status: "active",
          lastCall: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          avgLatency: 118
        }
      ]
    };
    
    res.json(connection);
  } catch (error) {
    console.error("Error fetching EMR connection:", error);
    res.status(500).json({ error: "Failed to fetch EMR connection" });
  }
});

// Sync EMR data
router.post('/connections/:id/sync', async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    const { dataType } = req.body;
    
    console.log(`Syncing EMR connection ${connectionId} for data type: ${dataType}`);
    
    // Mock sync process
    const syncResult = {
      syncId: Math.floor(Math.random() * 10000),
      connectionId,
      dataType: dataType || "all",
      status: "in_progress",
      startedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };
    
    res.json(syncResult);
  } catch (error) {
    console.error("Error initiating EMR sync:", error);
    res.status(500).json({ error: "Failed to initiate EMR sync" });
  }
});

// Get sync status
router.get('/sync/:syncId', async (req, res) => {
  try {
    const syncId = parseInt(req.params.syncId);
    
    const syncStatus = {
      syncId,
      status: "completed",
      progress: 100,
      recordsProcessed: 1456,
      recordsUpdated: 1234,
      recordsCreated: 222,
      errors: 0,
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      completedAt: new Date().toISOString()
    };
    
    res.json(syncStatus);
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({ error: "Failed to fetch sync status" });
  }
});

// Get EMR data
router.get('/data/:dataType', async (req, res) => {
  try {
    const { dataType } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    let data: any[] = [];
    
    if (dataType === 'patients') {
      data = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1980-01-01",
          mrn: "MRN001",
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          dateOfBirth: "1985-05-15",
          mrn: "MRN002",
          lastUpdated: new Date().toISOString()
        }
      ];
    } else if (dataType === 'appointments') {
      data = [
        {
          id: 1,
          patientId: 1,
          appointmentDate: "2024-01-15T10:00:00Z",
          provider: "Dr. Johnson",
          status: "scheduled",
          lastUpdated: new Date().toISOString()
        }
      ];
    }
    
    res.json({
      data,
      total: data.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error("Error fetching EMR data:", error);
    res.status(500).json({ error: "Failed to fetch EMR data" });
  }
});

// Test EMR connection
router.post('/connections/:id/test', async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    
    const testResult = {
      connectionId,
      status: "success",
      latency: 142,
      timestamp: new Date().toISOString(),
      details: {
        authentication: "passed",
        apiAccess: "passed",
        dataRetrieval: "passed"
      }
    };
    
    res.json(testResult);
  } catch (error) {
    console.error("Error testing EMR connection:", error);
    res.status(500).json({ error: "Failed to test EMR connection" });
  }
});

export default router; 