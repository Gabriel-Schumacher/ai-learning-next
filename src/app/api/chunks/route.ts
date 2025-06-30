import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
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
    
    const client = await clientPromise;
    const db = client.db();
    
    const chunks = await db.collection('chunks')
      .find({ documentId: new ObjectId(documentId) })
      .sort({ 'metadata.chunkIndex': 1 })
      .project({
        text: 1,
        metadata: 1,
      })
      .toArray();
    
    return NextResponse.json({ chunks });
  } catch (error: any) {
    console.error('Error fetching chunks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chunks' },
      { status: 500 }
    );
  }
}
