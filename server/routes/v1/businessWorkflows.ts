import express from 'express';
import { storage } from '../../db/storage';
import { insertBusinessWorkflowSchema } from '../../db/schema';

const router = express.Router();

// Get all business workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await storage.getAllBusinessWorkflows();
    res.json(workflows);
  } catch (error) {
    console.error("Error fetching business workflows:", error);
    res.status(500).json({ error: "Failed to fetch business workflows" });
  }
});

// Get business workflow by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const workflow = await storage.getBusinessWorkflow(id);
    
    if (!workflow) {
      return res.status(404).json({ error: "Business workflow not found" });
    }
    
    res.json(workflow);
  } catch (error) {
    console.error("Error fetching business workflow:", error);
    res.status(500).json({ error: "Failed to fetch business workflow" });
  }
});

// Create new business workflow
router.post('/', async (req, res) => {
  try {
    const validationResult = insertBusinessWorkflowSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Invalid workflow data", 
        details: validationResult.error.errors 
      });
    }

    const workflowData = validationResult.data;
    const newWorkflow = await storage.createBusinessWorkflow(workflowData);
    res.status(201).json(newWorkflow);
  } catch (error) {
    console.error("Error creating business workflow:", error);
    res.status(500).json({ error: "Failed to create business workflow" });
  }
});

// Update business workflow
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.createdAt;
    delete updates.createdBy;
    
    const updatedWorkflow = await storage.updateBusinessWorkflow(id, updates);
    res.json(updatedWorkflow);
  } catch (error) {
    console.error("Error updating business workflow:", error);
    res.status(500).json({ error: "Failed to update business workflow" });
  }
});

// Delete business workflow
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBusinessWorkflow(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting business workflow:", error);
    res.status(500).json({ error: "Failed to delete business workflow" });
  }
});

export default router; 