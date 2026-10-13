import type { Metadata } from "next";
import GameHub from "@/components/game/GameHub";

export const metadata: Metadata = {
  description: "Interactive missions inspired by real deepfake crimes.",
};

export default function GamePage() {
  return <GameHub />;
}
