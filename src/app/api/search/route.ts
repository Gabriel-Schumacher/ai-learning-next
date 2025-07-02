import { NextRequest } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const documentId = searchParams.get('documentId');

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    console.log(`Search request: query=${query}, documentId=${documentId || 'all'}`);
    
    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();
    
    // Find the right database with documents collection
    const adminDb = client.db().admin();
    const dbInfo = await adminDb.listDatabases();
    const dbNames = dbInfo.databases.map((db: any) => db.name)
      .filter((name: string) => !['admin', 'local', 'config'].includes(name));
    
    const results: any[] = [];

    // First try the semantic search with embeddings
    let useSemanticSearch = true;
    let queryEmbedding = null;
    
    // Check if OpenAI API key is available
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, skipping vector search");
      useSemanticSearch = false;
    }

    // Try to generate embedding if semantic search is requested
    if (useSemanticSearch) {
      try {
        console.log("Attempting to generate embedding for query");
        
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: query,
            model: 'text-embedding-3-small',
          }),
        });
        
        if (!embeddingResponse.ok) {
          const errorText = await embeddingResponse.text();
          console.error('OpenAI embedding API error:', errorText);
          throw new Error(`Failed to generate embedding: ${embeddingResponse.status} - ${errorText}`);
        }
        
        const embeddingData = await embeddingResponse.json();
        queryEmbedding = embeddingData.data?.[0]?.embedding;
        
        if (!queryEmbedding) {
          console.error("Invalid response from OpenAI embedding API:", embeddingData);
          throw new Error("Missing embedding in API response");
        }
        
        console.log("Successfully generated embedding");
      } catch (e) {
        console.error("Error generating embedding:", e);
        useSemanticSearch = false;
      }
    }

    // Search for chunks in all databases or specific document
    for (const dbName of dbNames) {
      const db = client.db(dbName);
      
      // Build the query filter for document ID if provided
      let documentFilter: any = {};
      
      if (documentId) {
        documentFilter = {
          $or: [
            { documentId },
            { documentId: new ObjectId(documentId) },
            { documentId: documentId.toString() },
            { originalDocumentId: new ObjectId(documentId) }
          ]
        };
      }
      
      try {
        const chunksCollection = db.collection('chunks');
        let similarChunks: any[] = [];
        
        // Try vector search if we have an embedding
        if (useSemanticSearch && queryEmbedding) {
          try {
            console.log(`Attempting vector search in database: ${dbName}`);
            
            // Attempt vector search
            similarChunks = await chunksCollection.aggregate([
              { $match: documentFilter },
              {
                $vectorSearch: {
                  queryVector: queryEmbedding,
                  path: "embedding",
                  numCandidates: 100,
                  limit: 10
                }
              },
              {
                $project: {
                  _id: 1,
                  text: 1,
                  documentId: 1,
                  score: { $meta: "vectorSearchScore" }
                }
              }
            ]).toArray();
            
            console.log(`Vector search in ${dbName} returned ${similarChunks.length} results`);
          } catch (e) {
            console.warn(`Vector search unavailable in ${dbName}, error:`, e);
            // Vector search failed, will fall back to text search below
            similarChunks = [];
          }
        }
        
        // Fall back to text search if vector search failed or wasn't attempted
        if (similarChunks.length === 0) {
          console.log(`Falling back to text search in ${dbName}`);
          
          try {
            // Try text search if an index exists
            similarChunks = await chunksCollection.find({
              ...documentFilter,
              $text: { $search: query }
            }).limit(20).toArray();
            
            console.log(`Text index search returned ${similarChunks.length} results`);
          } catch (e) {
            console.warn("Text search error (index might not exist):", e);
          }
          
          // If text search also failed, try basic regex search
          if (similarChunks.length === 0) {
            console.log("Falling back to regex search");
            similarChunks = await chunksCollection.find({
              ...documentFilter,
              text: { $regex: query, $options: 'i' }
            }).limit(20).toArray();
            
            console.log(`Regex search returned ${similarChunks.length} results`);
          }
        }
        
        // Process any results we found
        if (similarChunks.length > 0) {
          // Enrich results with document info
          for (const chunk of similarChunks) {
            try {
              let docId = chunk.documentId;
              if (typeof docId === 'string' && ObjectId.isValid(docId)) {
                docId = new ObjectId(docId);
              }
              
              const docInfo = await db.collection('documents').findOne(
                { $or: [{ _id: docId }, { id: docId }] }
              );
              
              results.push({
                text: chunk.text,
                score: chunk.score,
                documentId: chunk.documentId?.toString(),
                documentTitle: docInfo?.title || docInfo?.fileName || 'Unknown document'
              });
            } catch (e) {
              console.error("Error enriching document info:", e);
              
              // Still add the result even without document info
              results.push({
                text: chunk.text,
                score: chunk.score,
                documentId: chunk.documentId?.toString(),
                documentTitle: 'Unknown document'
              });
            }
          }
        }
      } catch (e) {
        console.error(`Error searching in ${dbName}:`, e);
      }
    }
    
    console.log(`Search completed with ${results.length} total results`);
    
    // Return the search results
    return new Response(JSON.stringify({ results }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed', 
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
