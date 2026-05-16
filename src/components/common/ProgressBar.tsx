export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full orange-gradient" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-slate-600">{value}%</span>
    </div>
  );
}
