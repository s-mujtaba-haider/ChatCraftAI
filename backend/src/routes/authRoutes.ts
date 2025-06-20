import { Router } from 'express';
import { register, login, refreshToken, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh',authenticate, refreshToken);
router.get('/me', authenticate, getCurrentUser);


export default router;
