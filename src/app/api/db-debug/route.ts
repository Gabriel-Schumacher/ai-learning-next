import { NextResponse } from 'next/server';
import clientPromise, { listDatabases, getDb } from '@/lib/mongodb';

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise;
    
    // List all available databases
    const dbInfo = await listDatabases();
    const databases = dbInfo.databases.map((db: any) => db.name);
    
    // Get a list of collections in each database
    const collectionsMap: Record<string, string[]> = {};
    
    // Check each database for documents and chunks collections
    const dbStats: Record<string, any> = {};
    
    for (const dbName of databases) {
      // Skip admin and local databases
      if (['admin', 'local'].includes(dbName)) continue;
      
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();
      collectionsMap[dbName] = collections.map(c => c.name);
      
      // Check for documents collection and count documents
      if (collections.some(c => c.name === 'documents')) {
        const docsCount = await db.collection('documents').countDocuments();
        const docSample = await db.collection('documents').findOne({});
        
        // Check for chunks collection and count chunks
        const chunksCount = collections.some(c => c.name === 'chunks')
          ? await db.collection('chunks').countDocuments()
          : 0;
          
        // Sample one chunk to see its structure
        const chunkSample = chunksCount > 0 
          ? await db.collection('chunks').findOne({})
          : null;
          
        dbStats[dbName] = {
          documentsCount: docsCount,
          chunksCount,
          documentFields: docSample ? Object.keys(docSample) : [],
          chunkFields: chunkSample ? Object.keys(chunkSample) : []
        };
      }
    }
    
    return NextResponse.json({ 
      status: "Connected successfully", 
      databases,
      collections: collectionsMap,
      stats: dbStats,
      message: "Use this information to determine the correct database name"
    });
  } catch (error: any) {
    console.error('MongoDB debug failed:', error);
    return NextResponse.json(
      { 
        status: "Connection failed", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
