import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'You are authenticated!', userId: req.userId });
});

export default router;
