import type { TagTone } from "@/data/clubs";
import { accessLabel, type AccessVerified } from "@/data/clubs";

export function PhotoSlot({
  label,
  className = "",
  ratio,
}: {
  label: string;
  className?: string;
  ratio?: string;
}) {
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
