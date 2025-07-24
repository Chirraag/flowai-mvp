import express from 'express';
import { storage } from '../../db/storage';

const router = express.Router();

// Get workflow orchestrations by patient ID
router.get('/:patientId', async (req, res) => {
  try {
    const patientId = parseInt(req.params.patientId);
    const workflows = await storage.getWorkflowOrchestrationsByPatient(patientId);
    res.json(workflows);
  } catch (error) {
    console.error("Error fetching workflows:", error);
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

// Create new workflow
router.post('/', async (req, res) => {
  try {
    const workflowData = req.body;
    const newWorkflow = await storage.createWorkflowOrchestration(workflowData);
    res.status(201).json(newWorkflow);
  } catch (error) {
    console.error("Error creating workflow:", error);
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

export default router; 