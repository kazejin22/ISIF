import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma over node-postgres. Any Postgres works (Neon, Supabase, Vercel / Prisma
// Postgres direct URLs). Without a postgres:// URL the online leaderboard is off
// and the game falls back to the scores saved on the device.

function connectionString(): string | null {
  for (const url of [process.env.DATABASE_URL, process.env.POSTGRES_URL]) {
    if (url && /^postgres(ql)?:\/\//.test(url)) return url;
  }
  return null;
}

const globalForDb = globalThis as unknown as { prisma?: PrismaClient };

/** The shared Prisma client, or null when no database is configured. */
export function getDb(): PrismaClient | null {
  if (globalForDb.prisma) return globalForDb.prisma;
  const url = connectionString();
  if (!url) return null;
  // One small pool per serverless instance is plenty for a leaderboard.
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 3 }) });
  globalForDb.prisma = client;
  return client;
}
