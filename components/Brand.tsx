import Link from "next/link";

export function LogoMark() {
  return (
    <span className="logo-tile">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alive-mark.png" alt="" />
    </span>
  );
}

export function BrandLockup() {
  return (
    <Link href="/" className="brand">
      <LogoMark />
      <span>
        <span className="wordmark">ALIVE SPORT</span>
        <span className="tagline">Find your play</span>
      </span>
    </Link>
  );
}
