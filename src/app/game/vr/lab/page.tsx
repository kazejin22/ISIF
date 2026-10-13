import type { Metadata } from "next";
import LabLoader from "./LabLoader";

export const metadata: Metadata = {
  description: "Inspect evidence with an AI scanner in virtual reality.",
};

export default function LabPage() {
  return <LabLoader />;
}
