import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import customerRoutes from './routes/customer.routes';

dotenv.config();

const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection using Prisma
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', service: 'customer-service' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(503).json({ status: 'unhealthy', service: 'user-service', error: errorMessage });
  }
});

// Swagger documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerDocument = require('../swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Customer service running on port ${PORT}`);
});
