import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MissionPlayer from "@/components/game/MissionPlayer";
import { MISSIONS, getMission } from "@/game/missions";

export function generateStaticParams() {
  return MISSIONS.map((m) => ({ mission: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ mission: string }> }): Promise<Metadata> {
  const mission = getMission((await params).mission);
  return { title: mission ? `${mission.title} — Deepfake Detective` : "Deepfake Detective" };
}

export default async function MissionPage({ params }: { params: Promise<{ mission: string }> }) {
  const mission = getMission((await params).mission);
  if (!mission) notFound();
  return <MissionPlayer mission={mission} />;
}
