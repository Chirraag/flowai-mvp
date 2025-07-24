import express from 'express';
import v1Routes from './v1';

const router = express.Router();

// Mount v1 routes
router.use('/v1', v1Routes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'FlowAI Healthcare API',
    version: '1.0.0',
    description: 'Healthcare workflow automation and AI management API',
    endpoints: {
      v1: '/api/v1',
      health: '/api/health'
    }
  });
});

export default router; 