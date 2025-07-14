import OpenAI from 'openai';
import { DataSubmitBody } from '@/lib/types/types';
import { MongoClient, ObjectId } from 'mongodb';

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY as string,
});

function generateJsonPrompt(numberOfQuestions: number, subject: string, prompt: string): string {
    return `You will return a JSON object with one property called "questions". Its value must be an array containing exactly ${numberOfQuestions} question objects:

Important instructions:
- The ${subject} is the topic of the qestions.
- The ${prompt} is details about the topic.
- The outer structure must be a JSON object with a single key: "questions".
- The value of "questions" must be a JSON array of exactly ${numberOfQuestions} objects.
- Each object must contain all required fields.
- Questions options can be strings, numbers, including but not limited to true and false.
- Do not include any extra text or comments. Only return the raw JSON object.
- Avoid saying which of the following, rather just ask a question directly.`;
}

const SYSTEM_PROMPTS = {
    'jsondata': generateJsonPrompt,
};

type SystemPromptKey = keyof typeof SYSTEM_PROMPTS;

async function getDocumentChunks(documentId: string, subject: string) {
    try {
        // Get MongoDB connection with potential database names to try
        const client = new MongoClient(process.env.MONGODB_URI as string);
        await client.connect();
        
        // List all databases to help debug
        const adminDb = client.db().admin();
        const dbInfo = await adminDb.listDatabases();
        const dbNames = dbInfo.databases.map((db: any) => db.name);
        console.log(`Available databases: ${dbNames.join(', ')}`);
        
        // Try to find the document in each database that isn't admin/local
        let document = null;
        let db = null;
        let correctDb = null;

        for (const dbName of dbNames) {
            if (['admin', 'local'].includes(dbName)) continue;
            
            db = client.db(dbName);
            console.log(`Looking for document in database: ${dbName}`);
            
            try {
                // Try to find the document using string ID first
                document = await db.collection('documents').findOne({ 
                    _id: new ObjectId(documentId) 
                });
                
                // If not found, try with ObjectId
                if (!document) {
                    try {
                        document = await db.collection('documents').findOne({ 
                            _id: new ObjectId(documentId) 
                        });
                    } catch (e) {
                        console.log(`Invalid ObjectId format for ${documentId}`);
                    }
                }
                
                if (document) {
                    console.log(`Found document in database: ${dbName}`);
                    correctDb = db;
                    break;
                }
            } catch (err) {
                console.log(`Error searching in ${dbName}:`, err);
            }
        }
        
        if (!document || !correctDb) {
            console.error(`Document with ID ${documentId} not found in any database`);
            
            // Debugging: Try to list some documents in each database
            for (const dbName of dbNames) {
                if (['admin', 'local'].includes(dbName)) continue;
                
                db = client.db(dbName);
                try {
                    const sampleDocs = await db.collection('documents')
                        .find({})
                        .limit(5)
                        .project({ _id: 1, fileName: 1 })
                        .toArray();
                    
                    if (sampleDocs.length > 0) {
                        console.log(`Found ${sampleDocs.length} documents in ${dbName}:`, 
                            sampleDocs.map(d => `${d._id} - ${d.fileName || 'unnamed'}`));
                    }
                } catch (e) {
                    // Collection might not exist
                }
            }
            
            await client.close();
            return [];
        }
        
        console.log(`Found document: ${document.fileName || document.title || 'Untitled'}`);
            
        // Try all possible formats for documentId to find chunks
        const chunks = await correctDb.collection('chunks')
            .find({ 
                $or: [
                    { documentId: documentId }, // String format
                    { documentId: document._id }, // Original format
                    { documentId: document._id.toString() }, // String of _id
                    { documentId: new ObjectId(documentId) }, // ObjectId from string
                    { originalDocumentId: document._id } // From our updated schema
                ]
            })
            .project({ text: 1, metadata: 1 })
            .toArray();
        
        console.log(`Retrieved ${chunks.length} chunks from document in database ${correctDb.databaseName}`);
        
        await client.close();
        
        // ...rest of the function remains the same...
        if (chunks.length === 0) {
            console.warn("No chunks found for this document");
            return [];
        }
        
        // Create embedding for the subject to find relevant chunks
        if (chunks.length > 10) {
            try {
                // Generate embedding for the subject query
                const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input: `${subject} questions and answers`,
                        model: 'text-embedding-3-small',
                    }),
                });
                
                if (embeddingResponse.ok) {
                    const embeddingData = await embeddingResponse.json();
                    const queryEmbedding = embeddingData.data[0].embedding;
                    
                    // Filter for chunks with embeddings
                    const chunksWithEmbeddings = chunks.filter(chunk => chunk.embedding);
                    
                    if (chunksWithEmbeddings.length > 0 && db) {
                        // Connect to MongoDB again to use $vectorSearch if available
                        await client.connect();
                        
                        try {
                            // Try to use vector search if available
                            const relevantChunks = await db.collection('chunks')
                                .find({ 
                                    documentId,
                                    $vectorSearch: {
                                        queryVector: queryEmbedding,
                                        path: "embedding",
                                        numCandidates: 20,
                                        limit: 10
                                    }
                                })
                                .toArray();
                            
                            if (relevantChunks.length > 0) {
                                console.log("Used vector search to find relevant chunks");
                                await client.close();
                                return relevantChunks.map(chunk => chunk.text);
                            }
                        } catch (e) {
                            console.warn("Vector search not available, falling back to random sampling", e);
                        } finally {
                            await client.close();
                        }
                    }
                }
            } catch (e) {
                console.error("Error during embedding search:", e);
                // Fall back to random sampling if embedding search fails
            }
            
            // If we couldn't do semantic search, just take some random samples
            console.log("Using random sampling of chunks");
            const randomChunks = chunks
                .sort(() => 0.5 - Math.random())
                .slice(0, 10);
                
            return randomChunks.map(chunk => chunk.text);
        }
        
        // Return all chunks if there are 10 or fewer
        return chunks.map(chunk => chunk.text);
    } catch (error) {
        console.error('Error fetching document chunks:', error);
        return [];
    }
}

export async function POST(req: Request) {
    try {
        const body: DataSubmitBody & { documentId?: string } = await req.json();
        const { prompt, systemPrompt, subject, numberOfQuestions, documentId } = body;

        console.log("Received request with numberOfQuestions:", numberOfQuestions);
        console.log("Document ID:", documentId);
        console.log("Prompt provided:", prompt && prompt.length > 0);
        console.log("Subject/Collection name:", subject);

        // Check if we have at least one of: prompt or documentId
        const hasPrompt = prompt && Array.isArray(prompt) && prompt.length > 0 && 
                        prompt[0]?.content && prompt[0].content.trim() !== '';
        const hasDocument = !!documentId;

        if (!hasPrompt && !hasDocument) {
            return new Response('Either a prompt or document is required', { status: 400 });
        }

        const promptGenerator = SYSTEM_PROMPTS[systemPrompt as SystemPromptKey];
        if (!promptGenerator) {
            return new Response('Invalid system prompt', { status: 400 });
        }

        const numQuestions = typeof numberOfQuestions === 'number' && numberOfQuestions > 0
            ? Math.floor(numberOfQuestions)
            : 1;

        console.log("Using numberOfQuestions:", numQuestions);
        
        // Collection name (can be empty)
        const collectionName = subject || '';

        // Fetch document chunks if documentId is provided
        let documentContext = '';
        if (documentId) {
            const chunks = await getDocumentChunks(documentId, collectionName);
            if (chunks.length > 0) {
                console.log(`Using ${chunks.length} document chunks as context`);
                documentContext = `
You MUST use the following document content to create quiz questions.
Create questions that test the reader's understanding of specific facts and concepts from this content.
Your questions should reflect the information in these document excerpts as closely as possible.

DOCUMENT CONTENT:
${chunks.join('\n\n----\n\n')}

IMPORTANT: Base your questions primarily on the document content above.
`;
            } else {
                console.warn("No document chunks found, proceeding without document context");
            }
        }

        const basePrompt = typeof promptGenerator === 'function'
            ? promptGenerator(numQuestions, collectionName || 'the provided content', systemPrompt)
            : promptGenerator;

        // Enhanced system prompt that prioritizes document content
        const enhancedPrompt = hasDocument 
            ? `${basePrompt}
            
${documentContext}

Additional instructions:
1. Your questions MUST be based on the document content provided.
2. Do not make up information that is not in the document.
3. Ensure all answer options are distinct and clear.
4. The correct answer must be explicitly found in or directly inferable from the document content.`
            : basePrompt;

        console.log("Sending request to OpenAI with document context:", !!documentContext);
        
        // Define the proper message type expected by OpenAI
        type ChatMessage = {
            role: 'system' | 'user' | 'assistant';
            content: string;
        };

        // Create a properly typed array that can accept different message roles
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `${enhancedPrompt}\n\nPlease respond with a valid JSON object where the "questions" key maps to an array of exactly ${numQuestions} quiz questions.`
            },
        ];

        // Only add user prompt if it's provided
        if (hasPrompt) {
            // Map each prompt item to ensure it has the correct structure
            const promptMessages = prompt.map(p => ({
                role: p.role as 'user' | 'assistant',
                content: p.content
            }));
            messages.push(...promptMessages);
        } else {
            // If no prompt is provided, add a simple prompt based on the document
            messages.push({
                role: 'user',
                content: `Generate ${numQuestions} quiz questions based on the document content provided.`
            });
        }
        
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
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
                                        answer: { type: ["string", "number"] }
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
}
