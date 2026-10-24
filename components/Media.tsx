import type { TagTone } from "@/data/clubs";
import { accessLabel, type AccessVerified } from "@/data/clubs";

export function PhotoSlot({
  label,
  className = "",
  ratio,
  src,
}: {
  label: string;
  className?: string;
  ratio?: string;
  src?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={label}
        className={`photo-slot photo-slot-image ${className}`}
        style={ratio ? { aspectRatio: ratio } : undefined}
      />
    );
  }

  return (
    <div className={`photo-slot ${className}`} style={ratio ? { aspectRatio: ratio } : undefined}>
      {label}
    </div>
  );
}

export function Tag({ label, tone }: { label: string; tone: TagTone }) {
  return <span className={`tag tag-${tone}`}>{label}</span>;
}

export function AccessTag({ verified }: { verified: AccessVerified }) {
  return <Tag label={accessLabel(verified)} tone="neutral" />;
}
