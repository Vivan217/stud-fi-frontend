import { lazy, Suspense, useState, useCallback } from "react";
import BalanceCard from "@/components/BalanceCard";
import AddExpense from "@/components/AddExpense";
import TransactionHistory from "@/components/TransactionHistory";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const DisciplineScore = lazy(() => import("@/components/DisciplineScore"));
const SpendingVelocity = lazy(() => import("@/components/SpendingVelocity"));
const CategoryChart = lazy(() => import("@/components/CategoryChart"));
const TrendChart = lazy(() => import("@/components/TrendChart"));

const Index = () => {
  const { profile, signOut } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    setRefreshKey((k) => k + 1);
    window.dispatchEvent(new CustomEvent("expense-added"));
  }, []);

  const { pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd } =
    usePullToRefresh(handleRefresh);

  return (
    <div
      className="min-h-screen px-5 py-10 pb-32 max-w-sm mx-auto relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="absolute left-0 right-0 flex items-center justify-center z-30 pointer-events-none"
          style={{
            top: `${Math.min(pullDistance, 80) - 40}px`,
            opacity: Math.min(pullDistance / 60, 1),
            transition: refreshing ? "none" : "opacity 0.15s",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "hsla(0,0%,8%,0.95)",
              border: "1px solid hsla(4,90%,52%,0.3)",
              boxShadow: "0 0 20px hsla(4,90%,52%,0.15)",
            }}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 border-transparent ${refreshing ? "animate-spin" : ""}`}
              style={{
                borderTopColor: "hsl(var(--primary))",
                borderRightColor: pullDistance >= 80 ? "hsl(var(--primary))" : "transparent",
                transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Background ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, hsla(4,90%,52%,0.08) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "300px",
          height: "300px",
          background: "radial-gradient(ellipse at center, hsla(4,90%,52%,0.05) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div
        className="relative z-10"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance > 0 ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* Brand header */}
        <motion.div
          className="mb-10 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="font-hero text-2xl tracking-widest" style={{ color: "hsl(var(--primary))" }}>
              STUD-FI
            </h2>
            <p className="font-display text-[9px] tracking-[0.3em] text-text-tertiary uppercase mt-0.5">
              {profile?.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Financial Discipline System"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "hsl(var(--primary))", boxShadow: "0 0 10px hsla(4,90%,52%,0.8)" }}
              />
              <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">Live</span>
            </div>
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: "hsla(0,0%,10%,0.8)", border: "1px solid hsl(0,0%,14%)" }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" style={{ color: "hsl(var(--text-tertiary))" }} />
            </button>
          </div>
        </motion.div>

        {/* Balance hero */}
        <section className="mb-12">
          <BalanceCard key={refreshKey} />
        </section>

        {/* Divider */}
        <div
          className="mb-6 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--border)), transparent)" }}
        />

        <Suspense fallback={<div className="grid grid-cols-2 gap-3 mb-3"><div className="h-[160px] rounded-2xl animate-pulse" style={{ background: "hsl(var(--card))" }} /><div className="h-[160px] rounded-2xl animate-pulse" style={{ background: "hsl(var(--card))" }} /></div>}>
          {/* Score + Velocity */}
          <section className="grid grid-cols-2 gap-3 mb-3">
            <DisciplineScore />
            <SpendingVelocity />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-2 gap-3">
            <CategoryChart />
            <TrendChart />
          </section>
        </Suspense>

        {/* Transaction History */}
        <TransactionHistory />
      </div>

      <AddExpense />
    </div>
  );
};

export default Index;
