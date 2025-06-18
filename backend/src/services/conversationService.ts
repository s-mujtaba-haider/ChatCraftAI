import prisma from '../prisma';

export const createOneToOneChat = async (userId1: string, userId2: string) => {
  const existing = await prisma.membership.findMany({
    where: {
      userId: userId1,
      conversation: {
        isGroup: false,
        members: {
          some: {
            userId: userId2,
          },
        },
      },
    },
    include: { conversation: true },
  });

  if (existing.length > 0) return existing[0].conversation;

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: false,
      members: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
  });

  return conversation;
};

export const createGroupChat = async (title: string, memberIds: string[]) => {
  const conversation = await prisma.conversation.create({
    data: {
      isGroup: true,
      title,
      members: {
        create: memberIds.map(id => ({ userId: id })),
      },
    },
  });

  return conversation;
};

export const getUserConversations = async (userId: string) => {
  return await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  });
};
