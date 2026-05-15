import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export type DonutDatum = { name: string; value: number; color: string };

export function DonutChart({ data, centerLabel }: { data: DonutDatum[]; centerLabel: string }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={42} outerRadius={66} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-slate-950">{data.reduce((sum, item) => sum + item.value, 0)}</span>
          <span className="text-[11px] text-slate-500">{centerLabel}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            <span className="text-slate-600">{item.name}</span>
            <span className="font-semibold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
