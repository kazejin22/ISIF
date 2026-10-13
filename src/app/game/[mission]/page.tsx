import { notFound } from "next/navigation";
import MissionPlayer from "@/components/game/MissionPlayer";
import { MISSIONS, getMission } from "@/game/missions";

export function generateStaticParams() {
  return MISSIONS.map((m) => ({ mission: m.id }));
}

export default async function MissionPage({ params }: { params: Promise<{ mission: string }> }) {
  const mission = getMission((await params).mission);
  if (!mission) notFound();
  return <MissionPlayer mission={mission} />;
}
