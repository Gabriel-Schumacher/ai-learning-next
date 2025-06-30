import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { cosineSimilarity } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { query, documentId, limit = 5 } = await req.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Generate embedding for the search query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small',
      }),
    });
    
    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
    }
    
    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    
    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    
    // Build the filter for finding chunks
    let filter: any = {};
    if (documentId) {
      filter.documentId = new ObjectId(documentId);
    }
    
    // Get chunks to search through
    const chunks = await db.collection('chunks')
      .find(filter)
      .toArray();
    
    // Sort by similarity
    const results = chunks
      .map(chunk => {
        return {
          ...chunk,
          score: cosineSimilarity(queryEmbedding, chunk.embedding)
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        text: item.text,
        score: item.score,
        documentName: item.metadata.fileName,
        metadata: item.metadata
      }));
    
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
