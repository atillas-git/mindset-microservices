import { Router } from 'express';
import axios from 'axios';
import services from '../config/services.config';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const healthChecks: { [key: string]: string } = {};
  
  // Check each service
  for (const [serviceName, config] of Object.entries(services)) {
    try {
      await axios.get(`${config.url}/health`);
      healthChecks[serviceName] = 'healthy';
    } catch (error:any) {
      logger.error(`Health check failed for ${serviceName}: ${error.message}`);
      healthChecks[serviceName] = 'unhealthy';
    }
  }
  
  const isHealthy = Object.values(healthChecks).every(status => status === 'healthy');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: healthChecks
  });
});

export default router;
