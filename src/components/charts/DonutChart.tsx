import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const colors = ["#ff5a0a", "#ff9b75", "#b8b3ad", "#d4d4d4", "#ece8e4"];

export default function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-44 w-44">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={2}>
            {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
