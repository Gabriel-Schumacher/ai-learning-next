import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query, chunks } = await req.json();
    
    if (!query || !chunks || !chunks.length) {
      return NextResponse.json(
        { error: 'Query and chunks are required' },
        { status: 400 }
      );
    }
    
    const prompt = `
You're a study guide assistant. Here's content from the document:

${chunks.map((c: string, i: number) => `(${i + 1}) ${c}`).join("\n\n")}

Now, based on that content only, answer the following question:
${query}

If the answer cannot be determined from the provided content, say so.
`;
    
    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the document context provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });
    
    if (!completion.ok) {
      throw new Error(`OpenAI API error: ${completion.statusText}`);
    }
    
    const result = await completion.json();
    const answer = result.choices[0].message.content;
    
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Error generating answer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate answer' },
      { status: 500 }
    );
  }
}
