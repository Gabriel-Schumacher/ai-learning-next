import OpenAI from 'openai';
import { DataSubmitBody } from '@/lib/types/types';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

function generateJsonPrompt(numberOfQuestions: number): string {
    return `You will return a JSON object with one property called "questions". Its value must be an array containing exactly ${numberOfQuestions} question objects, each structured like this:

Important instructions:
- The outer structure must be a JSON object with a single key: "questions".
- The value of "questions" must be a JSON array of exactly ${numberOfQuestions} objects.
- Each object must contain all required fields.
- Do not include any extra text or comments. Only return the raw JSON object.`;
}

const SYSTEM_PROMPTS = {
    'jsondata': generateJsonPrompt,
};

type SystemPromptKey = keyof typeof SYSTEM_PROMPTS;

export async function POST(req: Request) {
    try {
        const body: DataSubmitBody = await req.json();
        const { chats, systemPrompt, subject, numberOfQuestions } = body;

        console.log("Received request with numberOfQuestions:", numberOfQuestions);

        if (!chats || !Array.isArray(chats)) {
            return new Response('Invalid chat history', { status: 400 });
        }

        const promptGenerator = SYSTEM_PROMPTS[systemPrompt as SystemPromptKey];
        if (!promptGenerator) {
            return new Response('Invalid system prompt', { status: 400 });
        }

        const numQuestions = typeof numberOfQuestions === 'number' && numberOfQuestions > 0
            ? Math.floor(numberOfQuestions)
            : 1;

        console.log("Using numberOfQuestions:", numQuestions);

        const selectedPrompt = typeof promptGenerator === 'function'
            ? promptGenerator(numQuestions)
            : promptGenerator;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `${selectedPrompt}\n\nSubject: ${subject}\n\nPlease respond with a valid JSON object where the "questions" key maps to an array of exactly ${numQuestions} quiz questions.`
                },
                ...body.chats,
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "quiz_questions",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            questions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        question: { type: "string" },
                                        options: {
                                            type: "array",
                                            items: { type: "string" },
                                            minItems: 2,
                                            maxItems: 4
                                        },
                                        answer: { type: "string" }
                                    },
                                    required: ["id", "question", "options", "answer"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["questions"],
                        additionalProperties: false
                    }
                }
            },
            stream: false
        });

        const raw = completion.choices[0]?.message?.content;
        const parsed = JSON.parse(raw ?? '{}');
        
        return new Response(JSON.stringify(parsed), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
    } catch (err) {
        console.error('Error in AI handler:', err);
        return new Response('Server error', { status: 500 });
    }
};
