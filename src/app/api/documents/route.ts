import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDb } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    // Use the helper function to get the database with the correct name
    const db = await getDb();
    
    // Check if the collection exists
    const collections = await db.listCollections({ name: 'documents' }).toArray();
    if (collections.length === 0) {
      // Collection doesn't exist yet, return empty array instead of error
      return NextResponse.json({ documents: [] });
    }
    
    // Get documents
    const documents = await db.collection('documents')
      .find({})
      .sort({ createdAt: -1 })
      .project({
        fileName: 1,
        createdAt: 1,
        chunkCount: 1
      })
      .toArray();
    
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    // Return more detailed error message for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
