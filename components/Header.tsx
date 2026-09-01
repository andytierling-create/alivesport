"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "./Brand";

const links = [
  { href: "/clubs", label: "Find a club", match: "/clubs" },
  { href: "/wellness", label: "Wellness", match: "/wellness" },
  { href: "/clubs", label: "What's on", match: "/whats-on" },
  { href: "/for-clubs", label: "For clubs", match: "/for-clubs" },
  { href: "/about", label: "About us", match: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <Link
          href="/for-clubs"
          className="btn-cta"
          onClick={() => setOpen(false)}
        >
          List your club
        </Link>
      </nav>
    </header>
  );
}
