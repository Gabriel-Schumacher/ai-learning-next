import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb'; // Use consistent DB access
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const documentId = url.searchParams.get('documentId');
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const db = await getDb();
    console.log(`Looking up chunks for document ID: ${documentId}`);
    
    // Try both string and ObjectId versions to be safe
    const chunks = await db.collection('chunks')
      .find({ 
        $or: [
          { documentId: documentId },
          { documentId: new ObjectId(documentId) },
          { originalDocumentId: new ObjectId(documentId) }
        ]
      })
      .sort({ 'metadata.chunkIndex': 1 })
      .project({
        text: 1,
        metadata: 1,
      })
      .toArray();
    
    console.log(`Found ${chunks.length} chunks for document ${documentId}`);
    
    return NextResponse.json({ chunks });
  } catch (error: any) {
    console.error('Error fetching chunks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chunks' },
      { status: 500 }
    );
  }
}
