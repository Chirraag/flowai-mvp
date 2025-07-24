import express from 'express';
import { storage } from '../../db/storage';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await storage.getAllAppointments();
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const appointment = await storage.getAppointment(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;
    const newAppointment = await storage.createAppointment(appointmentData);
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

export default router; 