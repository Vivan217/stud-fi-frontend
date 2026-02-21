import { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PremiumCard from "./PremiumCard";

const data = [
  { name: "Food", value: 45, color: "hsl(4,90%,52%)" },
  { name: "Transport", value: 25, color: "hsl(4,90%,38%)" },
  { name: "Academic", value: 20, color: "hsl(0,0%,28%)" },
  { name: "Other", value: 10, color: "hsl(0,0%,18%)" },
];

const CategoryChart = memo(() => {
  return (
    <PremiumCard className="p-5" delay={0.35}>
      <h3 className="font-display text-[10px] font-semibold text-text-tertiary mb-4 tracking-[0.25em] uppercase">
        By Category
      </h3>
      <div className="flex items-center gap-3">
        <div className="w-[68px] h-[68px] flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={32}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center red dot */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "hsl(var(--primary))", boxShadow: "0 0 8px hsla(4,90%,52%,0.8)" }}
            />
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-1 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] font-display font-medium tracking-wide" style={{ color: "hsl(var(--text-secondary))" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
});

export default CategoryChart;
