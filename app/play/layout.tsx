import type { Metadata } from "next";
import { requireDemo } from "@/lib/demo-guard";

export const metadata: Metadata = {
  title: "Play",
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  requireDemo();
  return children;
}
