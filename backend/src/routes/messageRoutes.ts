import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { sendMessage, getConversationMessages } from '../services/messageService';

const router = Router();
router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  const { conversationId, text } = req.body;
  const message = await sendMessage(req.userId!, conversationId, text);
  res.json(message);
});

router.get('/:conversationId', async (req, res) => {
  const messages = await getConversationMessages(req.params.conversationId);
  res.json(messages);
});

export default router;
