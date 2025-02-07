import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJWT, validateRole } from '../middleware/auth.middleware';

const router = Router();

// Protected routes - require authentication
router.use(authenticateJWT);

// Customer management routes
router.post('/', validateRole(['sales_rep', 'admin']), CustomerController.createCustomer);
router.get('/:id', CustomerController.getCustomer);
router.put('/:id', validateRole(['sales_rep', 'admin']), CustomerController.updateCustomer);
router.delete('/:id', validateRole(['admin']), CustomerController.deleteCustomer);
router.get('/', CustomerController.listCustomers);

// Customer notes routes
router.post('/:id/notes', validateRole(['sales_rep', 'admin']), CustomerController.addNote);
router.delete('/:id/notes/:noteId', validateRole(['sales_rep', 'admin']), CustomerController.deleteNote);

// Tags routes
router.get('/tags/list', CustomerController.listTags);

export default router;
