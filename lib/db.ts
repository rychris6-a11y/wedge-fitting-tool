// lib/db.ts
// Shared connection pool to Supabase's Postgres database.
// Reused across all three API routes rather than opening a new
// connection per request — Postgres connections are relatively
// expensive to establish, and serverless functions can reuse this
// across invocations within the same warm instance.

import { Pool } from "pg";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Add it in Vercel's Environment Variables settings."
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase's connection requires SSL; rejectUnauthorized: false
      // is the standard setting for Supabase's managed certs.
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}
