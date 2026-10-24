import type { Metadata } from "next";
import { requireDemo } from "@/lib/demo-guard";

export const metadata: Metadata = {
  title: "Club desk",
};

export default function DeskLayout({ children }: { children: React.ReactNode }) {
  requireDemo();
  return children;
}
