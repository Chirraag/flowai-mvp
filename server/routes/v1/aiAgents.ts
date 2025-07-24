import express from 'express';
import { storage } from '../../db/storage';

const router = express.Router();

// Get all AI agents
router.get('/', async (req, res) => {
  try {
    const agents = await storage.getAllAiAgents();
    res.json(agents);
  } catch (error) {
    console.error("Error fetching AI agents:", error);
    res.status(500).json({ error: "Failed to fetch AI agents" });
  }
});

// Get AI agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agentId = parseInt(req.params.id);
    const agent = await storage.getAiAgent(agentId);
    
    if (!agent) {
      return res.status(404).json({ error: "AI agent not found" });
    }
    
    res.json(agent);
  } catch (error) {
    console.error("Error fetching AI agent:", error);
    res.status(500).json({ error: "Failed to fetch AI agent" });
  }
});

// Get agent interactions by patient ID
router.get('/interactions/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const interactions = await storage.getAgentInteractionsByPatient(patientId);
    res.json(interactions);
  } catch (error) {
    console.error("Error fetching agent interactions:", error);
    res.status(500).json({ error: "Failed to fetch agent interactions" });
  }
});

// Create new AI agent
router.post('/', async (req, res) => {
  try {
    const agentData = req.body;
    const newAgent = await storage.createAiAgent(agentData);
    res.status(201).json(newAgent);
  } catch (error) {
    console.error("Error creating AI agent:", error);
    res.status(500).json({ error: "Failed to create AI agent" });
  }
});

export default router; 