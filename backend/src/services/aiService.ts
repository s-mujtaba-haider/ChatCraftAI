import { OpenAI } from 'openai';
import prisma from '../prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export const suggestQuickReplies = async (conversationId: string) => {
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    include: { sender: true },
    take: 10,
  });

  const formatted = recentMessages
    .reverse()
    .map((msg) => `${msg.sender.displayName}: ${msg.text}`)
    .join('\n');

  const prompt = `
You are a helpful assistant. Based on the chat below, suggest 3 short, friendly reply options:

${formatted}

Reply in JSON array format: ["Okay!", "Sure, tell me more.", "Sounds interesting."]
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.choices[0].message.content?.trim();
  if (!text) return [];

  try {
    const suggestions = JSON.parse(text);
    return Array.isArray(suggestions) ? suggestions : [];
  } catch {
    return [];
  }
};

export const correctGrammar = async (text: string) => {
  const prompt = `Correct the grammar and make this more professional, but keep it short:\n\n"${text}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const corrected = response.choices[0].message.content?.trim();
  return corrected;
};

export const summarizeConversation = async (conversationId: string) => {
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    include: { sender: true },
    take: 30,
  });

  const formatted = recentMessages
    .map((msg) => `${msg.sender.displayName}: ${msg.text}`)
    .join('\n');

  const prompt = `
You are a helpful assistant analyzing a conversation. Based on the following chat, provide:
1. A short 3-4 sentence summary.
2. The overall sentiment: Positive, Negative, or Neutral.

Chat:
${formatted}

Respond in this format:

{
  "summary": "...",
  "sentiment": "Positive"
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0].message.content?.trim();
  try {
    const result = JSON.parse(content || '{}');
    return result;
  } catch {
    return { summary: 'Unable to summarize.', sentiment: 'Unknown' };
  }
};


