import { ChevronDown } from "lucide-react";

export function FilterBar({ filters }: { filters: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button key={filter} className="btn-ghost min-w-36 justify-between">
          {filter}
          <ChevronDown className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
