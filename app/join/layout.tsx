import type { Metadata } from "next";
import { requireDemo } from "@/lib/demo-guard";

export const metadata: Metadata = {
  title: "Join",
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  requireDemo();
  return children;
}
