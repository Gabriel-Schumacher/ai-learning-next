import { NextRequest, NextResponse } from 'next/server';
import clientPromise, { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    // Use the helper function to get the database with the correct name
    const db = await getDb();
    console.log(`Fetching documents from database: ${db.databaseName}`);
    
    // Check if the collection exists
    const collections = await db.listCollections({ name: 'documents' }).toArray();
    if (collections.length === 0) {
      console.log('Documents collection does not exist yet');
      // Collection doesn't exist yet, return empty array instead of error
      return NextResponse.json({ documents: [] });
    }
    
    // Get documents
    const documents = await db.collection('documents')
      .find({})
      .sort({ createdAt: -1 })
      .project({
        fileName: 1,
        title: 1,
        createdAt: 1,
        chunkCount: 1
      })
      .toArray();
    
    console.log(`Found ${documents.length} documents`);
    
    // Format the response
    const formattedDocuments = documents.map(doc => ({
      id: doc._id.toString(),
      title: doc.title || doc.fileName || 'Untitled Document',
      description: doc.description,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined
    }));
    
    return NextResponse.json({ 
      success: true, 
      documents: formattedDocuments 
    });
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

export async function DELETE(req: NextRequest) {
  try {
    // Get document ID from the request
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Use the helper function to get the database with the correct name
    const db = await getDb();
    
    // Create ObjectId from the documentId string
    const objectId = new ObjectId(documentId);
    
    // Delete the document
    const deleteResult = await db.collection('documents').deleteOne({
      _id: objectId
    });
    
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    // Delete related chunks - ensure we're using ObjectId for matching
    await db.collection('chunks').deleteMany({
      documentId: objectId
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document and related chunks deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete document',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
