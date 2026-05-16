import { MoreVertical } from "lucide-react";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export default function Table<T>({ columns, rows, onRowClick }: { columns: Column<T>[]; rows: T[]; onRowClick?: (row: T) => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
          <tr>{columns.map((column) => <th key={column.header} className={`px-3 py-3 font-bold ${column.className ?? ""}`}>{column.header}</th>)}<th className="w-10" /></tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => (
            <tr key={index} onClick={() => onRowClick?.(row)} className="cursor-pointer transition hover:bg-orange-50/50">
              {columns.map((column) => <td key={column.header} className={`px-3 py-2.5 align-middle text-slate-700 ${column.className ?? ""}`}>{column.render(row)}</td>)}
              <td className="px-2"><MoreVertical className="h-4 w-4 text-slate-400" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
