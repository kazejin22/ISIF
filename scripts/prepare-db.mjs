// Runs before `next build`: creates/updates the leaderboard table when a Postgres
// database is connected (Supabase, Neon, …). Without one, or if the database
// can't be reached, the build continues and the site uses the scores saved on
// each device instead.
//
// Schema changes need a direct (or session) connection, not a transaction pooler,
// so a direct URL is preferred when one is set:
//   DIRECT_URL                — set it yourself (Supabase: "Session pooler" or "Direct connection")
//   POSTGRES_URL_NON_POOLING  — set by Vercel's Supabase / Neon integrations
import { execSync } from "node:child_process";

const isPg = (u) => u && /^postgres(ql)?:\/\//.test(u);
const url = [process.env.DIRECT_URL, process.env.POSTGRES_URL_NON_POOLING, process.env.DATABASE_URL, process.env.POSTGRES_URL].find(isPg);

if (!url) {
  console.log("[prepare-db] No postgres:// database URL — skipping (online leaderboard off).");
} else {
  try {
    execSync(`npx prisma db push --url "${url}"`, { stdio: "inherit" });
  } catch {
    console.warn("[prepare-db] Could not sync the database schema — continuing the build without it.");
  }
}
