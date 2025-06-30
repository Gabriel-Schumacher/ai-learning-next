import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const dbInfo = await client.db().admin().listDatabases();
    
    return NextResponse.json({ 
      status: "Connected successfully", 
      databases: dbInfo.databases.map(db => db.name),
      message: "MongoDB connection is working"
    });
  } catch (error: any) {
    console.error('MongoDB connection test failed:', error);
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
