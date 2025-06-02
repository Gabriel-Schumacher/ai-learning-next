import OpenAI from 'openai';
import { DataSubmitBody } from '@/lib/types/types';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string, // Use the API key from .env
});

// Remove the hardcoded export and create a function to generate the prompt with dynamic number
function generateJsonPrompt(numberOfQuestions: number): string {
    return `When prompted by the user, you will create a JSON array containing exactly ${numberOfQuestions} question objects with the following structure:
[
    {
        "id": number,
        "question": string,
        "options": [string, string, string, string],
        "answer": string
    },
    {
        "id": number,
        "question": string,
        "options": [string, string, string, string],
        "answer": string
    },
    ... (and so on for a total of ${numberOfQuestions} objects)
]

Important instructions:
- Your response must be a valid JSON ARRAY with exactly ${numberOfQuestions} question objects.
- Each object must have all the fields specified in the schema above.
- In the options you will provide 4 possible answers to the question, one of which is the correct answer, or if the question is a true/false question, two options: "True" and "False".
- The "answer" field must contain the correct answer text, which must match exactly one of the options.
- Ensure the response is a valid JSON array of objects.
- Do not include any additional text or explanations, only the JSON array.
- Each question option should be formatted the same way without prefixes like 'A.', 'B.', etc.
`;
}

const SYSTEM_PROMPTS = {
    'jsondata': generateJsonPrompt, // Store the function instead of static string
}

type SystemPromptKey = keyof typeof SYSTEM_PROMPTS

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

        // Generate prompt with the requested number of questions
        // Ensure numberOfQuestions is a number and at least 1
        const numQuestions = typeof numberOfQuestions === 'number' && numberOfQuestions > 0 
            ? Math.floor(numberOfQuestions) 
            : 1; // Ensure valid number of questions
            
        console.log("Using numberOfQuestions:", numQuestions);

        
        const selectedPrompt = typeof promptGenerator === 'function' 
            ? promptGenerator(numQuestions) // Pass the correct number of questions
            : promptGenerator;

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: 'system', 
                    content: `${selectedPrompt}\n\nSubject: ${subject}\n\nPlease respond with a valid JSON array containing exactly ${numQuestions} question objects.` 
                },
                ...body.chats,
            ],
            response_format: { type: "json_object" },
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
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
          });
        } catch (err) {
          console.error('Error in AI handler:', err);
          return new Response('Server error', { status: 500 });
        }
};