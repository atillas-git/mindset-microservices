import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateJWT,validateRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/profile', authenticateJWT, UserController.getProfile);
router.put('/profile', authenticateJWT, UserController.updateProfile);
router.get('/users', authenticateJWT, validateRole(['admin']), UserController.listUsers);
router.delete('/users/:id', authenticateJWT, validateRole(['admin']), UserController.deleteUser);

export default router;