import type { Metadata } from "next";
import FirewallLoader from "./FirewallLoader";

export const metadata: Metadata = {
  description: "Slash fake posts and let credible ones pass, in virtual reality.",
};

export default function FirewallPage() {
  return <FirewallLoader />;
}
