import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BudgetCycle {
  monthly_budget: number;
  daily_safe_spend: number;
  total_spent: number;
  start_date: string;
  end_date: string;
}

const BalanceCard = () => {
  const { user, profile } = useAuth();
  const [cycle, setCycle] = useState<BudgetCycle | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("budget_cycles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setCycle(data as BudgetCycle | null));
  }, [user]);

  const remaining = cycle
    ? cycle.monthly_budget - cycle.total_spent
    : profile?.monthly_budget ?? 0;

  const daysLeft = cycle
    ? Math.max(0, Math.ceil((new Date(cycle.end_date).getTime() - Date.now()) / 86400000))
    : 12;

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative text-center pt-6 pb-2"
    >
      {/* Ambient red radial glow */}
      <div
        className="absolute ambient-glow pointer-events-none"
        style={{
          width: "340px",
          height: "340px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(ellipse at center, hsla(4,90%,52%,0.14) 0%, hsla(4,90%,52%,0.06) 45%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />

      <p className="font-display text-[11px] font-semibold tracking-[0.3em] text-text-tertiary uppercase mb-5">
        Remaining Balance
      </p>

      <h1
        className="font-hero leading-none tracking-tight mb-1"
        style={{
          fontSize: "clamp(3.6rem, 14vw, 5.5rem)",
          color: "hsl(var(--text-hero))",
          textShadow: "0 0 60px hsla(4,90%,52%,0.08)",
          letterSpacing: "-0.02em",
        }}
      >
        ₹{formatINR(remaining)}
      </h1>

      {/* Decorative red line */}
      <div className="flex items-center justify-center gap-3 my-5">
        <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)))" }} />
        <span
          className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full font-display text-sm font-semibold tracking-wide"
          style={{
            background: "linear-gradient(135deg, hsla(4,90%,52%,0.12) 0%, hsla(4,90%,52%,0.06) 100%)",
            border: "1px solid hsla(4,90%,52%,0.3)",
            color: "hsl(var(--primary))",
            boxShadow: "0 0 20px hsla(4,90%,52%,0.08)",
          }}
        >
          Safe/day: ₹{cycle ? Math.round(cycle.daily_safe_spend) : "—"}
        </span>
        <div className="h-px flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), transparent)" }} />
      </div>

      <p className="font-display text-[10px] font-semibold tracking-[0.3em] text-text-tertiary uppercase">
        Budget Cycle — {daysLeft} days left
      </p>
    </motion.div>
  );
};

export default BalanceCard;
