import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { MAX_MISSION_SCORE, SCORED_MISSION_IDS } from "@/game/missions";

// Online leaderboard. Each player (a random id kept on their device) has one row
// per mission holding their best score; the board ranks players by the sum.
// Scores come from the browser, so they are validated but can't be proven —
// fine for a classroom / exhibition leaderboard.

export const dynamic = "force-dynamic";

export interface GlobalRow {
  playerId: string;
  name: string;
  total: number;
  missions: number;
}

export type LeaderboardResponse =
  | { enabled: true; rows: GlobalRow[] }
  | { enabled: false; rows: [] };

const BOARD_SIZE = 20;
const PLAYER_ID = /^[A-Za-z0-9-]{8,64}$/;

function cleanName(value: unknown): string {
  return String(value ?? "")
    // Control characters only; React escapes everything else when rendering.
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 24);
}

export async function GET() {
  const db = getDb();
  if (!db) return NextResponse.json<LeaderboardResponse>({ enabled: false, rows: [] });
  try {
    // Latest name per player, so renaming on a device updates the board.
    const rows = await db.$queryRaw<{ playerId: string; name: string; total: bigint; missions: bigint }[]>`
      SELECT "playerId",
             (array_agg("playerName" ORDER BY "updatedAt" DESC))[1] AS name,
             SUM("score") AS total,
             COUNT(*) AS missions
      FROM "leaderboard"
      GROUP BY "playerId"
      ORDER BY total DESC, MIN("updatedAt") ASC
      LIMIT ${BOARD_SIZE}`;
    return NextResponse.json<LeaderboardResponse>({
      enabled: true,
      rows: rows.map((r) => ({ playerId: r.playerId, name: r.name, total: Number(r.total), missions: Number(r.missions) })),
    });
  } catch (e) {
    console.error("[leaderboard] read failed", e);
    return NextResponse.json({ error: "Leaderboard unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return NextResponse.json({ enabled: false });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
  if (!rateLimit(`leaderboard:${ip}`, 30, 60_000).ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const playerId = String(body.playerId ?? "");
  const name = cleanName(body.name);
  const missionId = String(body.missionId ?? "");
  const score = Number(body.score);
  if (!PLAYER_ID.test(playerId) || !name || !SCORED_MISSION_IDS.includes(missionId)
    || !Number.isInteger(score) || score < 0 || score > MAX_MISSION_SCORE) {
    return NextResponse.json({ error: "Invalid score" }, { status: 400 });
  }

  try {
    // Keep the best score; always refresh the name.
    await db.$executeRaw`
      INSERT INTO "leaderboard" ("id", "playerId", "playerName", "missionId", "score", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${playerId}, ${name}, ${missionId}, ${score}, NOW())
      ON CONFLICT ("playerId", "missionId") DO UPDATE SET
        "score" = GREATEST("leaderboard"."score", EXCLUDED."score"),
        "playerName" = EXCLUDED."playerName",
        "updatedAt" = CASE WHEN EXCLUDED."score" > "leaderboard"."score" THEN NOW() ELSE "leaderboard"."updatedAt" END`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[leaderboard] write failed", e);
    return NextResponse.json({ error: "Leaderboard unavailable" }, { status: 503 });
  }
}
