import { MongoClient, ServerApiVersion } from 'mongodb';

// Ensure your connection string includes the database name at the end
// e.g., mongodb://localhost:27017/ai-learning or mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-learning
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning';
const dbName = 'Cluster3780'; // Specify your database name here

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
export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}
