import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma over node-postgres. Any Postgres works: Supabase (use the pooler URL),
// Neon, Prisma Postgres direct URLs. Without a postgres:// URL the online
// leaderboard is off and the game falls back to the scores saved on the device.

function connectionString(): string | null {
  for (const url of [process.env.DATABASE_URL, process.env.POSTGRES_URL]) {
    if (url && /^postgres(ql)?:\/\//.test(url)) return url;
  }
  return null;
}

/**
 * Hosted databases need TLS. Supabase's certificate chain isn't in Node's default
 * trust store, so node-postgres rejects it when the URL says sslmode=require; we
 * keep the connection encrypted but skip the chain check, as Supabase's own
 * node-postgres guide does. The sslmode parameter is removed so it can't override this.
 */
function poolConfig(url: string) {
  const parsed = new URL(url);
  const local = ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (local) return { connectionString: url };
  parsed.searchParams.delete("sslmode");
  return { connectionString: parsed.toString(), ssl: { rejectUnauthorized: false } };
}

const globalForDb = globalThis as unknown as { prisma?: PrismaClient };

/** The shared Prisma client, or null when no database is configured. */
export function getDb(): PrismaClient | null {
  if (globalForDb.prisma) return globalForDb.prisma;
  const url = connectionString();
  if (!url) return null;
  // One small pool per serverless instance is plenty for a leaderboard.
  const client = new PrismaClient({ adapter: new PrismaPg({ ...poolConfig(url), max: 3 }) });
  globalForDb.prisma = client;
  return client;
}
