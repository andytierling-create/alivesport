"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "./Brand";
import { useDemo } from "./DemoProvider";
import { isPlatformClientEnabled } from "@/lib/demo-flag";

const links = [
  { href: "/clubs", label: "Find a club", match: "/clubs" },
  { href: "/wellness", label: "Wellness", match: "/wellness" },
  { href: "/whats-on", label: "What's on", match: "/whats-on" },
  { href: "/for-clubs", label: "For clubs", match: "/for-clubs" },
  { href: "/about", label: "About us", match: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const platform = isPlatformClientEnabled();
  const { role, adult, org, signOut } = useDemo();

  return (
    <header className={`masthead${open ? " open" : ""}`}>
      <BrandLockup />
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav className="nav" id="site-nav">
        {links.map((link) => {
          const active =
            link.match === "/clubs"
              ? pathname.startsWith("/clubs") && link.label === "Find a club"
              : pathname === link.match || pathname.startsWith(`${link.match}/`);
          return (
            <Link
              key={link.label}
              href={link.href}
              className={active ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          );
        })}
        {platform && role === "adult" ? (
          <Link
            href="/play"
            className={pathname.startsWith("/play") ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {adult?.displayName.split(" ")[0] ?? "Play"}
          </Link>
        ) : null}
        {platform && role === "org" ? (
          <Link
            href="/desk"
            className={pathname.startsWith("/desk") ? "active" : undefined}
            onClick={() => setOpen(false)}
          >
            {org?.name ?? "Club desk"}
          </Link>
        ) : null}
        {platform && role ? (
          <button
            type="button"
            className="nav-signout"
            onClick={() => {
              void signOut();
              setOpen(false);
            }}
          >
            Sign out
          </button>
        ) : null}
        {platform && !role ? (
          <Link href="/sign-in" onClick={() => setOpen(false)}>
            Sign in
          </Link>
        ) : null}
        {platform ? (
          <Link
            href={role === "org" ? "/desk" : role ? "/play" : "/join"}
            className="btn-cta"
            onClick={() => setOpen(false)}
          >
            {role === "org" ? "Club desk" : role ? "Your play" : "Join"}
          </Link>
        ) : (
          <Link href="/for-clubs" className="btn-cta" onClick={() => setOpen(false)}>
            List your club
          </Link>
        )}
      </nav>
    </header>
  );
}
