import express from 'express';

const router = express.Router();

// Get handoff requests
router.get('/', async (req, res) => {
  try {
    const handoffs = [
      {
        id: 1,
        patientId: 123,
        agentId: 1,
        reason: "complex_insurance_question",
        status: "pending",
        priority: "high",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimatedWaitTime: "5 minutes"
      },
      {
        id: 2,
        patientId: 456,
        agentId: 2,
        reason: "billing_dispute",
        status: "in_progress",
        priority: "medium",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        estimatedWaitTime: "2 minutes"
      }
    ];
    
    res.json(handoffs);
  } catch (error) {
    console.error("Error fetching handoffs:", error);
    res.status(500).json({ error: "Failed to fetch handoffs" });
  }
});

// Get handoff by ID
router.get('/:id', async (req, res) => {
  try {
    const handoffId = parseInt(req.params.id);
    
    const handoff = {
      id: handoffId,
      patientId: 123,
      agentId: 1,
      reason: "complex_insurance_question",
      status: "pending",
      priority: "high",
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      estimatedWaitTime: "5 minutes",
      context: {
        conversationHistory: [
          {
            timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
            speaker: "patient",
            message: "I need help with my insurance coverage"
          },
          {
            timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
            speaker: "ai",
            message: "I can help you with that. What specific questions do you have?"
          }
        ],
        patientInfo: {
          name: "John Doe",
          insurance: "Blue Cross Blue Shield",
          policyNumber: "BCBS123456"
        }
      }
    };
    
    res.json(handoff);
  } catch (error) {
    console.error("Error fetching handoff:", error);
    res.status(500).json({ error: "Failed to fetch handoff" });
  }
});

// Create handoff request
router.post('/', async (req, res) => {
  try {
    const { patientId, reason, priority = "medium", context } = req.body;
    
    if (!patientId || !reason) {
      return res.status(400).json({ error: "Patient ID and reason are required" });
    }
    
    // Mock handoff creation
    const handoff = {
      id: Math.floor(Math.random() * 10000),
      patientId,
      agentId: null, // Will be assigned by system
      reason,
      status: "pending",
      priority,
      createdAt: new Date().toISOString(),
      estimatedWaitTime: "3 minutes",
      context
    };
    
    res.status(201).json(handoff);
  } catch (error) {
    console.error("Error creating handoff:", error);
    res.status(500).json({ error: "Failed to create handoff" });
  }
});

// Update handoff status
router.put('/:id/status', async (req, res) => {
  try {
    const handoffId = parseInt(req.params.id);
    const { status, agentId } = req.body;
    
    if (!status || !['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    // Mock status update
    const updatedHandoff = {
      id: handoffId,
      status,
      agentId,
      updatedAt: new Date().toISOString()
    };
    
    res.json(updatedHandoff);
  } catch (error) {
    console.error("Error updating handoff status:", error);
    res.status(500).json({ error: "Failed to update handoff status" });
  }
});

// Get handoff queue
router.get('/queue/status', async (req, res) => {
  try {
    const queueStatus = {
      totalPending: 5,
      highPriority: 2,
      mediumPriority: 2,
      lowPriority: 1,
      avgWaitTime: "3.2 minutes",
      availableAgents: 3,
      estimatedWaitTime: {
        high: "2 minutes",
        medium: "5 minutes",
        low: "10 minutes"
      }
    };
    
    res.json(queueStatus);
  } catch (error) {
    console.error("Error fetching handoff queue:", error);
    res.status(500).json({ error: "Failed to fetch handoff queue" });
  }
});

// Assign handoff to agent
router.post('/:id/assign', async (req, res) => {
  try {
    const handoffId = parseInt(req.params.id);
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: "Agent ID is required" });
    }
    
    // Mock assignment
    const assignment = {
      handoffId,
      agentId,
      assignedAt: new Date().toISOString(),
      status: "assigned"
    };
    
    res.json(assignment);
  } catch (error) {
    console.error("Error assigning handoff:", error);
    res.status(500).json({ error: "Failed to assign handoff" });
  }
});

// Get handoff statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalHandoffs: 1247,
      avgResolutionTime: "8.5 minutes",
      satisfactionScore: 4.6,
      handoffRate: 12.3, // percentage of AI interactions that require handoff
      topReasons: [
        { reason: "complex_insurance_question", count: 234 },
        { reason: "billing_dispute", count: 189 },
        { reason: "scheduling_conflict", count: 156 }
      ]
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching handoff stats:", error);
    res.status(500).json({ error: "Failed to fetch handoff stats" });
  }
});

export default router; 