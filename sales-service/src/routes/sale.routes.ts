import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticateJWT, validateRole } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authenticateJWT);

// Create sale - Sales representatives and admins
router.post('/', validateRole(['sales_rep', 'admin']), SaleController.createSale);

// Get single sale
router.get('/:id', SaleController.getSale);

// Update sale
router.put('/:id', validateRole(['sales_rep', 'admin']), SaleController.updateSale);

// Delete sale - Admin only
router.delete('/:id', validateRole(['admin']), SaleController.deleteSale);

// List sales with filters
router.get('/', SaleController.listSales);

// Add note to sale
router.post('/:id/notes', validateRole(['sales_rep', 'admin']), SaleController.addNote);

// Update sale status
router.patch('/:id/status', validateRole(['sales_rep', 'admin']), SaleController.updateStatus);

export default router;
