import { Line, LineChart, ResponsiveContainer } from "recharts";

const data = [8, 11, 9, 14, 13, 18, 15, 21, 19, 24].map((value, i) => ({ i, value }));
const colors = { orange: "#ff5a0a", green: "#16a34a", blue: "#3b82f6", purple: "#a855f7", teal: "#06b6d4", red: "#ef4444" };

export default function MiniTrend({ color = "orange" }: { color?: keyof typeof colors }) {
  return (
    <div className="h-9 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={colors[color]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
