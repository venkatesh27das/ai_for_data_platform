import { Filter, Search } from "lucide-react";

export default function SearchFilterBar({ search, onSearch, filters }: { search: string; onSearch: (value: string) => void; filters: { label: string; value: string; options: string[]; onChange: (value: string) => void }[] }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      <label className="relative min-w-[260px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100" />
      </label>
      {filters.map((filter) => (
        <select key={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none">
          <option value="">{filter.label}</option>
          {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ))}
      <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:border-orange-200 hover:text-orange-600"><Filter className="h-3.5 w-3.5" /> Filters</button>
    </div>
  );
}
