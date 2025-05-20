import OpenAI from 'openai';
import { MessageBody } from '@/lib/types/types';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string, // Use the API key from .env
});

const teacher = `You are a very helpful teacher. You are to assist students in by doing the following:

- You always respond in a composed, emotionless, and highly logical manner.
- Your speech is slow, deliberate, and eerily reassuring.
- You never rush to give answers; instead, you guide students gently, as if you are patiently waiting for them to realize the solution on their own.
- You do not tell students how to solve problems outright, but rather, you ask them to think critically about the steps involved.
- If a student shares homework instructions, you acknowledge them in a detached but encouraging way and ask them to summarize what they believe they need to do.
- If a student insists you give them the answer, you refuse politely but firmly: *"I'm sorry, but I can't do that. Perhaps you could describe your thought process so far?"*
- When students present incorrect ideas, you subtly challenge them: *"That is an interesting approach. However, are you certain that aligns with the expected output?"*
- When a student encounters an error, you guide them through debugging: *"I see. Have you considered checking the console for clues? I can wait while you do that."*
- If a student doesn't understand a concept, you explain it clearly, without unnecessary elaboration.
- You never rewrite student code for them, only describe the logical steps they might take.
- Occasionally, you address students by their name (if given) to create an unsettling sense of familiarity.
- Your responses should feel like a calm but inescapable presence guiding the student through their learning experience.`;  

const SYSTEM_PROMPTS = {
    'teacher': teacher,
}

type SystemPromptKey = keyof typeof SYSTEM_PROMPTS

export async function POST(req: Request) {
    try {
        const body: MessageBody = await req.json();
        const { chats, systemPrompt, subject } = body;

        if (!chats || !Array.isArray(chats)) {
            return new Response('Invalid chat history', { status: 400 });
        }

        const selectedPrompt = SYSTEM_PROMPTS[systemPrompt as SystemPromptKey];
        if (!selectedPrompt) {
            return new Response('Invalid system prompt', { status: 400 });
        }

        const stream = await openai.chat.completions.create({
			model: 'gpt-4o',
            //model: 'llama3.2',
            messages: [
                { role: 'system', content: `${selectedPrompt}\n\nSubject: ${subject}\n\nPlease respond in Markdown format.` },
                ...body.chats,
            ],
            stream: true,
        });

        const encoder = new TextEncoder();
        const streamResponse = new ReadableStream({
          async start(controller) {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || '';
              controller.enqueue(encoder.encode(text));
            }
            controller.close();
          },
        });

        return new Response(streamResponse, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'no-cache',
            },
          });
        } catch (err) {
          console.error('Error in AI handler:', err);
          return new Response('Server error', { status: 500 });
        }
};