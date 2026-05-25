type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef1f6]" aria-label={`${value}% complete`}>
      <div className="h-full rounded-full bg-[var(--orange)]" style={{ width: `${value}%` }} />
    </div>
  );
}
