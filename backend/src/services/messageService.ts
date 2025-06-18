import prisma from '../prisma';

export const sendMessage = async (
  userId: string,
  conversationId: string,
  text: string
) => {
  const message = await prisma.message.create({
    data: {
      text,
      senderId: userId,
      conversationId,
    },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return message;
};

export const getConversationMessages = async (conversationId: string) => {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
};
