import { memo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingDown } from "lucide-react";
import PremiumCard from "./PremiumCard";

const data = [
  { v: 40 }, { v: 55 }, { v: 50 }, { v: 65 }, { v: 60 }, { v: 58 },
  { v: 52 }, { v: 48 }, { v: 45 }, { v: 42 },
];

const SpendingVelocity = memo(() => {
  return (
    <PremiumCard className="p-5 flex flex-col justify-between" delay={0.25}>
      <p className="font-display text-[10px] font-semibold tracking-[0.25em] text-text-tertiary uppercase mb-3">
        Spend Velocity
      </p>
      <div className="h-[72px] mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="velocityLineF1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(4,90%,52%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(4,90%,62%)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="v"
              stroke="url(#velocityLineF1)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "hsl(var(--primary))", boxShadow: "0 0 6px hsla(4,90%,52%,0.6)" }}
        />
        <span className="text-xs font-display font-semibold tracking-wide" style={{ color: "hsl(var(--primary))" }}>
          Slowing
        </span>
        <TrendingDown className="w-3 h-3" style={{ color: "hsl(var(--primary))" }} />
      </div>
    </PremiumCard>
  );
});

export default SpendingVelocity;
