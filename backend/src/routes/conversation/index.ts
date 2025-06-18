import { Router } from 'express';
import { Response } from 'express';
import { RequestHandler } from 'express';
import { createOneToOneChat, createGroupChat, getUserConversations } from '../../services/conversationService';
import authenticate, { AuthRequest } from '../../middleware/authMiddleware';
import prisma from '../../prisma';

const router = Router();

// Apply the authenticate middleware with proper typing
router.use((req, res, next) => {
  return authenticate(req as AuthRequest, res, next);
});

// POST /api/conversations/1to1 - Create a 1-to-1 chat
router.post('/1to1', (async (req: AuthRequest, res: Response) => {
  try {
    const input = req.body.userId; // can be email or displayName
    const userId = req.userId!;

    if (!input) {
      return res.status(400).json({ message: 'Please enter email or name' });
    }

    // First try by email
    let targetUser = await prisma.user.findUnique({
      where: { email: input }
    });

    // If not found by email, search by display name (non-unique)
    if (!targetUser) {
      const users = await prisma.user.findMany({
        where: {
          displayName: {
            equals: input,
            mode: 'insensitive'
          }
        }
      });

      if (users.length === 0) {
        return res.status(404).json({ message: 'No user found' });
      } else if (users.length > 1) {
        return res.status(409).json({ message: 'Multiple users found with that name. Please use email.' });
      } else {
        targetUser = users[0];
      }
    }

    if (targetUser.id === userId) {
      return res.status(400).json({ message: 'Cannot start chat with yourself' });
    }

    const chat = await createOneToOneChat(userId, targetUser.id);
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error starting 1:1 chat:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}) as RequestHandler);



// POST /api/conversations/group - Create a group chat
router.post('/group', async (req: AuthRequest, res) => {
  try {
    const { title, userIds } = req.body;
    const chat = await createGroupChat(title, userIds);
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ message: 'Failed to create group chat' });
  }
});

// GET /api/conversations - Get all conversations for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const chats = await getUserConversations(userId);
    res.json(chats);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// GET /api/conversations/groups - List all group chats
router.get('/groups', async (req: AuthRequest, res) => {
  try {
    const groups = await prisma.conversation.findMany({
      where: { isGroup: true },
      include: { 
        members: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching group chats:', error);
    res.status(500).json({ message: 'Failed to fetch group chats' });
  }
});

// POST /api/conversations/group/join - Join a group
router.post('/group/join', (async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.body.conversationId;
    const userId = req.userId!;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the conversation exists and is a group
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation || !conversation.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const alreadyJoined = await prisma.membership.findFirst({
      where: { userId, conversationId },
    });

    if (alreadyJoined) return res.json({ message: 'Already a member' });

    await prisma.membership.create({
      data: { userId, conversationId },
    });

    return res.json({ message: 'Joined group' });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ message: 'Failed to join group' });
  }
}) as RequestHandler);


// GET /api/conversations/:id - Get a single conversation by ID with full user info
router.get('/:id', (async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation by ID:', error);
    res.status(500).json({ message: 'Failed to fetch conversation' });
  }
}) as RequestHandler);


export default router;