import express from 'express';

const router = express.Router();

// Get all human agents
router.get('/', async (req, res) => {
  try {
    const agents = [
      {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@flowai.com",
        role: "Patient Coordinator",
        status: "online",
        department: "Scheduling",
        availability: "9:00 AM - 5:00 PM",
        currentQueue: 3,
        avgResponseTime: "2.1 minutes"
      },
      {
        id: 2,
        name: "Mike Chen",
        email: "mike.chen@flowai.com",
        role: "Insurance Specialist",
        status: "online",
        department: "Billing",
        availability: "8:00 AM - 4:00 PM",
        currentQueue: 1,
        avgResponseTime: "1.8 minutes"
      },
      {
        id: 3,
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@flowai.com",
        role: "Patient Advocate",
        status: "busy",
        department: "Patient Services",
        availability: "10:00 AM - 6:00 PM",
        currentQueue: 5,
        avgResponseTime: "3.2 minutes"
      }
    ];
    
    res.json(agents);
  } catch (error) {
    console.error("Error fetching human agents:", error);
    res.status(500).json({ error: "Failed to fetch human agents" });
  }
});

// Get human agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const agent = {
      id: agentId,
      name: "Sarah Johnson",
      email: "sarah.johnson@flowai.com",
      role: "Patient Coordinator",
      status: "online",
      department: "Scheduling",
      availability: "9:00 AM - 5:00 PM",
      currentQueue: 3,
      avgResponseTime: "2.1 minutes",
      performance: {
        totalCases: 1247,
        resolvedCases: 1189,
        satisfactionScore: 4.8,
        avgResolutionTime: "15.2 minutes"
      }
    };
    
    res.json(agent);
  } catch (error) {
    console.error("Error fetching human agent:", error);
    res.status(500).json({ error: "Failed to fetch human agent" });
  }
});

// Get agent queue status
router.get('/:id/queue', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const queueStatus = {
      agentId,
      currentQueue: 3,
      avgWaitTime: "2.1 minutes",
      estimatedWaitTime: "6.3 minutes",
      queueHistory: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          queueLength: 2
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          queueLength: 4
        }
      ]
    };
    
    res.json(queueStatus);
  } catch (error) {
    console.error("Error fetching agent queue:", error);
    res.status(500).json({ error: "Failed to fetch agent queue" });
  }
});

// Update agent status
router.put('/:id/status', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['online', 'busy', 'offline', 'break'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    // Mock status update
    res.json({
      agentId,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating agent status:", error);
    res.status(500).json({ error: "Failed to update agent status" });
  }
});

// Get agent performance metrics
router.get('/:id/performance', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    
    const performance = {
      agentId,
      totalCases: 1247,
      resolvedCases: 1189,
      satisfactionScore: 4.8,
      avgResolutionTime: "15.2 minutes",
      efficiency: 95.3,
      monthlyTrend: "+2.1%"
    };
    
    res.json(performance);
  } catch (error) {
    console.error("Error fetching agent performance:", error);
    res.status(500).json({ error: "Failed to fetch agent performance" });
  }
});

export default router; 