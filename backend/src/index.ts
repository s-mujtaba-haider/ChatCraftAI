import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import authenticate from './routes/protectedRoutes';
import conversationRoutes from './routes/conversation';
import messageRoutes from './routes/messageRoutes';
import aiRoutes from './routes/aiRoutes';
import cookieParser from 'cookie-parser';
import { sendMessage } from './services/messageService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cookieParser());
const allowedOrigin = 'http://localhost:3000';

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', authenticate);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);


app.get('/', (_, res) => {
  res.send('ChatCraftAI Backend Running 🚀');
});

// Socket handlers
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('join', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room ${conversationId}`);
  });

  socket.on('message:send', async (data) => {
    const { conversationId, text, senderId } = data;
    const message = await sendMessage(senderId, conversationId, text);
    io.to(conversationId).emit('message:new', message);
  });

  socket.on('typing:start', (data) => {
    socket.to(data.conversationId).emit('typing:start', data.userId);
  });

  socket.on('typing:stop', (data) => {
    socket.to(data.conversationId).emit('typing:stop', data.userId);
  });

  socket.on('disconnect', () => {
    console.log('⚡ User disconnected:', socket.id);
  });
});

// Start the combined server
server.listen(config.PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${config.PORT}`);
});