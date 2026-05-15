export function MiniTrendChart({ color = "#ff5a1f" }: { color?: string }) {
  const points = "0,26 12,18 24,22 36,13 48,17 60,8 72,15 84,7 96,10 108,2";
  return (
    <svg viewBox="0 0 108 32" className="h-8 w-28" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
