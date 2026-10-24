import type { Metadata } from "next";
import { requireDemo } from "@/lib/demo-guard";

export const metadata: Metadata = {
  title: "Embed an event",
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  requireDemo();
  return children;
}
