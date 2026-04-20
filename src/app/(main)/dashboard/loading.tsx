// src/app/(main)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "8px" }}>
        <Skeleton width={80} height={11} />
        <Skeleton width={180} height={24} style={{ marginTop: "10px" }} />
        <Skeleton width={240} height={13} style={{ marginTop: "6px" }} />
      </div>

      {/* Cards row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={5} />
      </div>
    </div>
  );
}

function Skeleton({ width, height, style }: { width?: number | string; height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: width ?? "100%",
      height: height ?? 14,
      background: "#1e2830",
      borderRadius: "6px",
      animation: "pulse 1.8s ease-in-out infinite",
      ...style,
    }} />
  );
}

function SkeletonCard({ lines }: { lines: number }) {
  return (
    <div style={{
      background: "#0e1318", border: "1px solid #1e2830",
      borderRadius: "14px", overflow: "hidden",
    }}>
      {/* Card header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e2830", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: 36, height: 36, borderRadius: "9px", background: "#1e2830", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={180} height={11} style={{ marginTop: "6px" }} />
        </div>
      </div>
      {/* Card body */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={i % 2 === 0 ? "100%" : "75%"} height={13} />
        ))}
      </div>
    </div>
  );
}