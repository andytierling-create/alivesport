export function AthleteFigures() {
  return (
    <div className="figures" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/alive-hero.png" alt="" />
    </div>
  );
}

export function GroupMark({
  variant,
}: {
  variant: "children" | "women" | "disabled" | "older";
}) {
  const style = { width: 34, height: 34, marginBottom: 18 };
  if (variant === "disabled") {
    return (
      <div
        style={{
          ...style,
          borderRadius: "50%",
          border: "5px solid #3B96DC",
        }}
        aria-hidden="true"
      />
    );
  }
  if (variant === "older") {
    return (
      <div
        style={{
          ...style,
          borderRadius: 10,
          background: "linear-gradient(140deg,#FFC94D,#FF2FA7)",
        }}
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      style={{
        ...style,
        borderRadius: "50%",
        background:
          variant === "women"
            ? "linear-gradient(140deg,#3B96DC,#FF2FA7)"
            : "linear-gradient(140deg,#FF2FA7,#3B96DC)",
      }}
      aria-hidden="true"
    />
  );
}
