import { memo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import PremiumCard from "./PremiumCard";

const data = [
  { d: 30 }, { d: 28 }, { d: 32 }, { d: 27 }, { d: 25 },
  { d: 22 }, { d: 18 }, { d: 15 }, { d: 12 }, { d: 10 }, { d: 9 }, { d: 8 },
];

const TrendChart = memo(() => {
  return (
    <PremiumCard className="p-5" delay={0.45}>
      <h3 className="font-display text-[10px] font-semibold text-text-tertiary mb-4 tracking-[0.25em] uppercase">
        Monthly Trend
      </h3>
      <div className="h-[68px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trendFillF1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(4,90%,52%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(4,90%,52%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="d"
              stroke="hsl(4,90%,52%)"
              strokeWidth={1.5}
              fill="url(#trendFillF1)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] font-display tracking-[0.2em] text-text-tertiary mt-2 text-right uppercase">
        Last 30 days
      </p>
    </PremiumCard>
  );
});

export default TrendChart;
