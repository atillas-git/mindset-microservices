import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { routeRequest } from './middleware/proxy.middleware';
import { rateLimiter } from './middleware/rate-limit.middleware';
import healthRoutes from './routes/health.routes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Health check routes
app.use('/health', healthRoutes);

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerDocument = require('../swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Route all API requests through the proxy middleware
app.use('/api', routeRequest);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
