import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json } from 'body-parser';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { createRateLimiter } from './config/rate-limiter';
import { errorHandler } from './middleware/error.middleware';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = parseInt(process.env.PORT || '3001');

app.use(helmet());
app.use(cors());
app.use(createRateLimiter());

app.use(json({ limit: '10mb' }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check MongoDB connection
    const db = mongoose.connection.db;
    await db!.admin().ping();
    res.status(200).json({ status: 'healthy', service: 'user-service' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(503).json({ status: 'unhealthy', service: 'user-service', error: errorMessage });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const swaggerDocument = require('../swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Mount routes without /api prefix since it's stripped by the gateway
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

connectDatabase();
app.listen(port, () => {
  logger.info(`User service listening on port ${port}`);
});

export default app;