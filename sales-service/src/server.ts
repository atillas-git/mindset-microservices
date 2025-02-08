import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import saleRoutes from './routes/sale.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sales-db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/sales', saleRoutes);

if (process.env.NODE_ENV !== 'production') {
  const swaggerDocument = require('../swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

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

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Sales service running on port ${PORT}`);
});
