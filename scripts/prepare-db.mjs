// Runs before `next build`: creates/updates the leaderboard table when a Postgres
// database is connected (e.g. Neon from the Vercel Marketplace). Without one, or if
// the database can't be reached, the build continues and the site uses the scores
// saved on each device instead.
import { execSync } from "node:child_process";

const url = [process.env.DATABASE_URL, process.env.POSTGRES_URL].find((u) => u && /^postgres(ql)?:\/\//.test(u));

if (!url) {
  console.log("[prepare-db] No postgres:// DATABASE_URL — skipping (online leaderboard off).");
} else {
  try {
    execSync(`npx prisma db push --url "${url}"`, { stdio: "inherit" });
  } catch {
    console.warn("[prepare-db] Could not sync the database schema — continuing the build without it.");
  }
}
