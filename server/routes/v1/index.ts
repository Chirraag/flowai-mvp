import express from 'express';
import authRoutes from './auth';
import workflowsRoutes from './workflows';
import businessWorkflowsRoutes from './businessWorkflows';

const router = express.Router();

// Mount all other routes
router.use('/auth', authRoutes);
router.use('/workflows', workflowsRoutes);
router.use('/business-workflows', businessWorkflowsRoutes);

// V1 API info
router.get('/', (req, res) => {
  res.json({
    version: 'v1',
    description: 'FlowAI Healthcare API v1',
    endpoints: {
      workflows: '/api/v1/workflows',
      businessWorkflows: '/api/v1/business-workflows',
      auth: '/api/v1/auth',
    }
  });
});

export default router; 