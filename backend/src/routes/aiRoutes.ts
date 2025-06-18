import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { suggestQuickReplies, correctGrammar, summarizeConversation } from '../services/aiService';

const router = Router();

router.use(authenticate);

router.post('/quick-replies', async (req: AuthRequest, res) => {
  const { conversationId } = req.body;
  const replies = await suggestQuickReplies(conversationId);
  res.json({ replies });
});

router.post('/grammar-correct', async (req: AuthRequest, res) => {
  const { text } = req.body;
  const corrected = await correctGrammar(text);
  res.json({ corrected });
});

router.get('/summary/:conversationId', async (req: AuthRequest, res) => {
  const { conversationId } = req.params;
  const result = await summarizeConversation(conversationId);
  res.json(result);
});


export default router;