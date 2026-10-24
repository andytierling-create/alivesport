import type { Metadata } from "next";
import { requireDemo } from "@/lib/demo-guard";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  requireDemo();
  return children;
}
