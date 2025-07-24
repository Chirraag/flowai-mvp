import express from 'express';
import { storage } from '../../db/storage';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const patients = await storage.getAllPatients();
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    const patient = await storage.getPatient(patientId);
    
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    
    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// Create new patient
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;
    const newPatient = await storage.createPatient(patientData);
    res.status(201).json(newPatient);
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

export default router; 