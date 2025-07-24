import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse the connection string to modify SSL settings
let connectionString = process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString,
  ssl: false
});

export const db = drizzle({ client: pool, schema });

// Export schema for convenience
export * from './schema'; 