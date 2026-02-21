import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

type Expense = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  created_at: string;
};

const categoryEmoji: Record<string, string> = {
  Food: "🍜",
  Transport: "🚌",
  Academic: "📚",
  Entertainment: "🎮",
  Bills: "⚡",
  Other: "📦",
};

const TransactionHistory = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("expenses")
      .select("id, amount, category, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setExpenses(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();

    // Immediate refetch when AddExpense records a new expense
    const handleExpenseAdded = () => fetchExpenses();
    window.addEventListener("expense-added", handleExpenseAdded);

    return () => {
      window.removeEventListener("expense-added", handleExpenseAdded);
    };
  }, [user]);

  return (
    <section className="mt-3">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <p
          className="font-display text-[9px] tracking-[0.3em] uppercase"
          style={{ color: "hsl(var(--text-tertiary))" }}
        >
          Recent Transactions
        </p>
        <div
          className="px-2 py-0.5 rounded-full"
          style={{
            background: "hsla(4,90%,52%,0.08)",
            border: "1px solid hsla(4,90%,52%,0.15)",
          }}
        >
          <span
            className="font-display text-[8px] tracking-[0.2em] uppercase"
            style={{ color: "hsl(var(--primary))" }}
          >
            Last 10
          </span>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0"
                  style={{ background: "hsla(0,0%,100%,0.04)" }}
                />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded w-20" style={{ background: "hsla(0,0%,100%,0.06)" }} />
                  <div className="h-2 rounded w-14" style={{ background: "hsla(0,0%,100%,0.04)" }} />
                </div>
                <div className="h-3 rounded w-12" style={{ background: "hsla(0,0%,100%,0.06)" }} />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">🧾</p>
            <p className="font-display text-xs tracking-wider" style={{ color: "hsl(var(--text-tertiary))" }}>
              No expenses yet
            </p>
            <p className="font-body text-[10px] mt-1" style={{ color: "hsl(var(--text-tertiary))" }}>
              Tap + to record your first expense
            </p>
          </div>
        ) : (
          <div>
            {expenses.map((expense, i) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom:
                    i < expenses.length - 1
                      ? "1px solid hsl(var(--border))"
                      : "none",
                }}
              >
                {/* Category icon */}
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
                  style={{
                    background: "hsla(4,90%,52%,0.07)",
                    border: "1px solid hsla(4,90%,52%,0.12)",
                  }}
                >
                  {categoryEmoji[expense.category] ?? "📦"}
                </div>

                {/* Category + time */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-display text-sm font-semibold tracking-wide truncate"
                    style={{ color: "hsl(var(--foreground))" }}
                  >
                    {expense.category}
                  </p>
                  <p
                    className="font-body text-[10px] mt-0.5"
                    style={{ color: "hsl(var(--text-tertiary))" }}
                  >
                    {formatDistanceToNow(new Date(expense.created_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="font-hero text-base tracking-tight"
                    style={{ color: "hsl(var(--primary))" }}
                  >
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </p>
                  {expense.note && (
                    <p
                      className="font-body text-[9px] mt-0.5 max-w-[80px] truncate"
                      style={{ color: "hsl(var(--text-tertiary))" }}
                    >
                      {expense.note}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionHistory;
