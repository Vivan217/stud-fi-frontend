import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Wallet, Home, Building2, MapPin, Target, ShoppingBag, Plane, Shield } from "lucide-react";

const LIFESTYLES = [
  { id: "hostel", label: "Hostel", desc: "On-campus living", icon: Building2 },
  { id: "day_scholar", label: "Day Scholar", desc: "Commuting daily", icon: MapPin },
  { id: "living_alone", label: "Living Alone", desc: "Independent setup", icon: Home },
];

const GOALS = [
  { id: "save", label: "Save Money", desc: "Build a corpus", icon: Wallet },
  { id: "buy_item", label: "Buy Something", desc: "Tech, gear, etc.", icon: ShoppingBag },
  { id: "trip", label: "Plan a Trip", desc: "Travel fund", icon: Plane },
  { id: "emergency_fund", label: "Emergency Fund", desc: "Safety net", icon: Shield },
];

const OnboardingFlow = () => {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [goalType, setGoalType] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalLabel, setGoalLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 3;

  // Calculate daily safe spend based on budget & lifestyle
  const calcDailySafeSpend = (monthlyBudget: number, lifestyleType: string) => {
    const multipliers: Record<string, number> = {
      hostel: 0.7,        // hostel provides food/housing
      day_scholar: 0.8,   // less overhead
      living_alone: 0.6,  // higher fixed costs
    };
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return (monthlyBudget * (multipliers[lifestyleType] || 0.75)) / daysInMonth;
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    const monthlyBudget = parseFloat(budget);
    if (isNaN(monthlyBudget) || monthlyBudget <= 0) {
      setError("Please enter a valid budget amount.");
      setLoading(false);
      return;
    }

    const dailySafeSpend = calcDailySafeSpend(monthlyBudget, lifestyle);

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        monthly_budget: monthlyBudget,
        lifestyle,
        goal_type: goalType,
        goal_amount: goalAmount ? parseFloat(goalAmount) : null,
        goal_label: goalLabel || null,
        onboarding_complete: true,
      })
      .eq("user_id", user.id);

    if (profileError) {
      setError("Failed to save profile. Please try again.");
      setLoading(false);
      return;
    }

    // Create first budget cycle
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await supabase.from("budget_cycles").insert({
      user_id: user.id,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      monthly_budget: monthlyBudget,
      daily_safe_spend: Math.round(dailySafeSpend * 100) / 100,
    });

    await refreshProfile();
    setLoading(false);
  };

  const canNext = () => {
    if (step === 1) return budget.trim() !== "" && parseFloat(budget) > 0;
    if (step === 2) return lifestyle !== "";
    if (step === 3) return goalType !== "";
    return false;
  };

  const SelectionCard = ({
    selected,
    onClick,
    icon: Icon,
    label,
    desc,
  }: {
    selected: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    desc: string;
  }) => (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200"
      style={{
        background: selected
          ? "linear-gradient(135deg, hsla(4,90%,52%,0.12), hsla(4,90%,52%,0.06))"
          : "hsla(0,0%,7%,0.8)",
        border: `1px solid ${selected ? "hsla(4,90%,52%,0.4)" : "hsl(0,0%,13%)"}`,
        boxShadow: selected ? "0 0 20px hsla(4,90%,52%,0.1)" : "none",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: selected ? "linear-gradient(135deg, hsl(4,90%,48%), hsl(0,85%,38%))" : "hsla(0,0%,12%,0.8)",
        }}
      >
        <Icon className="w-5 h-5" style={{ color: selected ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))" }} />
      </div>
      <div>
        <p className="font-display text-sm font-semibold tracking-wide" style={{ color: selected ? "hsl(0,0%,95%)" : "hsl(var(--text-secondary))" }}>
          {label}
        </p>
        <p className="font-body text-xs" style={{ color: "hsl(var(--text-tertiary))" }}>{desc}</p>
      </div>
      {selected && (
        <div
          className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--primary))" }}
        >
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </motion.button>
  );

  return (
    <div
      className="min-h-screen flex flex-col px-6 py-10 max-w-sm mx-auto relative"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Ambient */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, hsla(4,90%,52%,0.08) 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className="font-hero text-3xl tracking-widest mb-1" style={{ color: "hsl(var(--primary))" }}>
          STUD-FI
        </h1>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              className="h-0.5 flex-1 rounded-full"
              style={{ background: i < step ? "hsl(var(--primary))" : "hsl(0,0%,13%)" }}
              animate={{ background: i < step ? "hsl(4,90%,52%)" : "hsl(0,0%,13%)" }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
        <p className="font-display text-[9px] tracking-[0.3em] text-text-tertiary uppercase mt-2">
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Steps */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--text-hero))" }}>
                  Monthly Budget
                </h2>
                <p className="font-body text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
                  Enter your pocket money or stipend for this month.
                </p>
              </div>

              <div>
                <p className="font-display text-[9px] tracking-[0.3em] text-text-tertiary uppercase mb-3">Amount (₹)</p>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 font-hero text-2xl"
                    style={{ color: "hsl(var(--primary))" }}
                  >₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    max="999999"
                    className="w-full pl-10 pr-4 py-5 font-hero text-3xl outline-none rounded-xl"
                    style={{
                      background: "hsla(0,0%,7%,0.8)",
                      border: "1px solid hsl(0,0%,14%)",
                      color: "hsl(var(--text-hero))",
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[5000, 10000, 15000, 20000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBudget(String(amt))}
                    className="px-4 py-2 rounded-full font-display text-xs font-semibold tracking-wide transition-all"
                    style={{
                      background: budget === String(amt)
                        ? "linear-gradient(135deg, hsl(4,90%,48%), hsl(0,85%,38%))"
                        : "hsla(0,0%,9%,0.8)",
                      border: `1px solid ${budget === String(amt) ? "hsla(4,90%,52%,0.4)" : "hsl(0,0%,14%)"}`,
                      color: budget === String(amt) ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))",
                    }}
                  >
                    ₹{(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>

              {budget && parseFloat(budget) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: "hsla(4,90%,52%,0.06)",
                    border: "1px solid hsla(4,90%,52%,0.15)",
                  }}
                >
                  <p className="font-display text-[9px] tracking-[0.25em] text-text-tertiary uppercase mb-1">
                    Estimated Daily Safe Spend
                  </p>
                  <p className="font-hero text-2xl" style={{ color: "hsl(var(--primary))" }}>
                    ≈ ₹{Math.round(calcDailySafeSpend(parseFloat(budget), lifestyle || "hostel"))}
                    <span className="font-body text-xs text-text-tertiary ml-1">/day</span>
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--text-hero))" }}>
                  Lifestyle Type
                </h2>
                <p className="font-body text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
                  Your living situation affects your spending patterns.
                </p>
              </div>
              {LIFESTYLES.map((l) => (
                <SelectionCard
                  key={l.id}
                  selected={lifestyle === l.id}
                  onClick={() => setLifestyle(l.id)}
                  icon={l.icon}
                  label={l.label}
                  desc={l.desc}
                />
              ))}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight mb-1" style={{ color: "hsl(var(--text-hero))" }}>
                  Financial Goal
                </h2>
                <p className="font-body text-sm" style={{ color: "hsl(var(--text-tertiary))" }}>
                  What are you working towards this month?
                </p>
              </div>

              {GOALS.map((g) => (
                <SelectionCard
                  key={g.id}
                  selected={goalType === g.id}
                  onClick={() => setGoalType(g.id)}
                  icon={g.icon}
                  label={g.label}
                  desc={g.desc}
                />
              ))}

              {goalType && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2 pt-1"
                >
                  <p className="font-display text-[9px] tracking-[0.25em] text-text-tertiary uppercase">
                    Target Amount (optional)
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-hero text-xl" style={{ color: "hsl(var(--primary))" }}>₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      className="w-full pl-9 pr-4 py-3.5 font-hero text-xl outline-none rounded-xl"
                      style={{
                        background: "hsla(0,0%,7%,0.8)",
                        border: "1px solid hsl(0,0%,14%)",
                        color: "hsl(var(--text-hero))",
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder='Label e.g. "New Laptop"'
                    value={goalLabel}
                    onChange={(e) => setGoalLabel(e.target.value)}
                    maxLength={60}
                    className="w-full px-4 py-3 font-body text-sm outline-none rounded-xl"
                    style={{
                      background: "hsla(0,0%,7%,0.8)",
                      border: "1px solid hsl(0,0%,14%)",
                      color: "hsl(var(--text-hero))",
                    }}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <p className="font-body text-xs text-center py-2 mt-4" style={{ color: "hsl(0,84%,65%)" }}>
          {error}
        </p>
      )}

      {/* CTA */}
      <div className="pt-6 relative z-10">
        <motion.button
          onClick={() => {
            if (step < totalSteps) setStep(step + 1);
            else handleFinish();
          }}
          disabled={!canNext() || loading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-2"
          style={{
            background: canNext()
              ? "linear-gradient(135deg, hsl(4,90%,50%) 0%, hsl(0,85%,40%) 100%)"
              : "hsla(0,0%,10%,0.8)",
            color: canNext() ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))",
            boxShadow: canNext() ? "0 4px 30px hsla(4,90%,52%,0.3)" : "none",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Setting up..." : step < totalSteps ? (
            <><span>Continue</span><ChevronRight className="w-4 h-4" /></>
          ) : (
            <span>Launch Dashboard</span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
