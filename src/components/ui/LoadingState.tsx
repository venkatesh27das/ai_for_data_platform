export function LoadingState({ label = "Loading workspace" }: { label?: string }) {
  return (
    <div aria-live="polite" className="loading-grid" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 8 }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
