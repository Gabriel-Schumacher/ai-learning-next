import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(req: NextRequest) {
  try {
    const { documentId } = await req.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db();
    const objId = new ObjectId(documentId);
    
    // Delete the document
    await db.collection('documents').deleteOne({ _id: objId });
    
    // Delete all associated chunks
    await db.collection('chunks').deleteMany({ documentId: objId });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
