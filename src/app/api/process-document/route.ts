import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { chunkTextByParagraphs } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { text, fileName, metadata } = await req.json();
    
    if (!text || !fileName) {
      return NextResponse.json(
        { error: 'Text and fileName are required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    console.log(`Processing document in database: ${db.databaseName}`);
    
    // Create document entry
    const docResult = await db.collection('documents').insertOne({
      fileName,
      createdAt: new Date(),
      metadata: {
        ...metadata,
        processedAt: new Date()
      }
    });
    
    const documentId = docResult.insertedId;
    console.log(`Created document with ID: ${documentId}`);
    
    // Chunk the text
    const chunks = chunkTextByParagraphs(text);
    console.log(`Created ${chunks.length} chunks for processing`);
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding via OpenAI API
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: chunk,
          model: 'text-embedding-3-small',
        }),
      });
      
      if (!embeddingResponse.ok) {
        throw new Error(`OpenAI API error: ${embeddingResponse.statusText}`);
      }
      
      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;
      
      // Store chunk with embedding - IMPORTANT: Store documentId as string to ensure consistent lookup
      await db.collection('chunks').insertOne({
        documentId: documentId.toString(), // Store as string for consistency
        originalDocumentId: documentId, // Also store the ObjectId version
        text: chunk,
        embedding,
        metadata: {
          chunkIndex: i,
          fileName,
          ...metadata
        }
      });
    }
    
    // Update document with chunk count
    await db.collection('documents').updateOne(
      { _id: documentId },
      { $set: { chunkCount: chunks.length } }
    );
    
    return NextResponse.json({
      success: true,
      documentId: documentId.toString(), // Return string version of ID
      chunksProcessed: chunks.length,
    });
  } catch (error: any) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process document' },
      { status: 500 }
    );
  }
}
