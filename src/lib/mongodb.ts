import { MongoClient, ServerApiVersion } from 'mongodb';

// Your MongoDB connection string
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning';

// Important: Extract database name or use an explicit default
function getDatabaseName(mongoUri: string): string {
  // Check if URI has a database name at the end
  const uriParts = mongoUri.split('/');
  const lastPart = uriParts.pop() || '';
  
  // If there's a database name in the URI (after the last slash and no query params)
  if (lastPart && !lastPart.includes('?') && !lastPart.includes('@')) {
    return lastPart;
  }
  
  // Default database name if not specified in URI
  // This is critical - make sure it matches where your data is stored!
  return '3780-spring-2024'; // Try this explicit name based on your MongoDB Atlas cluster
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module that provides both the client and a function to get the database
export default clientPromise;

// Helper function to get the database with the specified name
export async function getDb(explicitDbName?: string) {
  const client = await clientPromise;
  const dbName = explicitDbName || getDatabaseName(uri);
  console.log(`Using database: ${dbName}`);
  return client.db(dbName);
}

// Helper function to list all available databases
export async function listDatabases() {
  const client = await clientPromise;
  const admin = client.db().admin();
  return await admin.listDatabases();
}
