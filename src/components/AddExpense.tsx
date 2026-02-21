import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["Food", "Transport", "Academic", "Entertainment", "Bills", "Other"];

const AddExpense = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cycleId, setCycleId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("budget_cycles")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => setCycleId(data?.id ?? null));
  }, [user]);

  const handleKey = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + ".");
    } else {
      setAmount((prev) => (prev === "0" ? key : prev + key));
    }
  };

  const handleAdd = async () => {
    if (!amount || amount === "0" || !selectedCategory || !user) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;

    setLoading(true);

    // Insert expense
    await supabase.from("expenses").insert({
      user_id: user.id,
      cycle_id: cycleId,
      amount: parsed,
      category: selectedCategory,
    });

    // Update cycle total spent
    if (cycleId) {
      const { data: cycle } = await supabase
        .from("budget_cycles")
        .select("total_spent")
        .eq("id", cycleId)
        .single();

      if (cycle) {
        await supabase
          .from("budget_cycles")
          .update({ total_spent: (cycle.total_spent ?? 0) + parsed })
          .eq("id", cycleId);
      }
    }

    setLoading(false);
    setAdded(true);
    // Notify TransactionHistory to refetch immediately
    window.dispatchEvent(new CustomEvent("expense-added"));
    setTimeout(() => {
      setAdded(false);
      setAmount("0");
      setSelectedCategory(null);
      setOpen(false);
    }, 1200);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];
  const isValid = amount !== "0" && selectedCategory;

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-50 animate-glow-pulse"
        style={{
          background: "linear-gradient(135deg, hsl(4,90%,48%) 0%, hsl(0,85%,38%) 100%)",
          boxShadow: "0 0 0 1px hsla(4,90%,52%,0.4), 0 8px 32px hsla(4,90%,52%,0.3)",
        }}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
      >
        <Plus className="w-6 h-6" style={{ color: "hsl(0,0%,98%)" }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "hsla(0,0%,3%,0.97)", backdropFilter: "blur(24px)" }}
          >
            {/* Red top stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: "linear-gradient(90deg, transparent 0%, hsl(4,90%,52%) 40%, hsl(4,90%,52%) 60%, transparent 100%)" }}
            />

            <div className="flex justify-end p-6">
              <motion.button
                onClick={() => setOpen(false)}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "hsla(0,0%,12%,0.8)", border: "1px solid hsla(0,0%,20%,0.6)" }}
              >
                <X className="w-4 h-4" style={{ color: "hsl(var(--text-secondary))" }} />
              </motion.button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="text-center"
                  >
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, hsl(4,90%,48%), hsl(0,85%,38%))",
                        boxShadow: "0 0 60px hsla(4,90%,52%,0.4)",
                      }}
                    >
                      <span className="text-white text-3xl font-hero">✓</span>
                    </div>
                    <p className="font-display text-xl font-bold tracking-wide" style={{ color: "hsl(var(--primary))" }}>
                      Expense Recorded
                    </p>
                    <p className="text-sm mt-2 font-body" style={{ color: "hsl(var(--text-tertiary))" }}>
                      ₹{amount} — {selectedCategory}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="w-full space-y-7"
                  >
                    <div className="text-center">
                      <p className="font-display text-[10px] font-semibold tracking-[0.3em] text-text-tertiary uppercase mb-4">
                        Amount
                      </p>
                      <p
                        className="font-hero leading-none"
                        style={{
                          fontSize: "clamp(3rem, 16vw, 4.5rem)",
                          color: "hsl(var(--text-hero))",
                          textShadow: amount !== "0" ? "0 0 40px hsla(4,90%,52%,0.2)" : "none",
                        }}
                      >
                        ₹{amount}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {categories.map((cat) => (
                        <motion.button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          whileTap={{ scale: 0.93 }}
                          className="px-4 py-2 rounded-full font-display text-xs font-semibold tracking-wide uppercase transition-all duration-200"
                          style={{
                            background: selectedCategory === cat
                              ? "linear-gradient(135deg, hsl(4,90%,48%), hsl(0,85%,38%))"
                              : "hsla(0,0%,10%,0.8)",
                            border: `1px solid ${selectedCategory === cat ? "hsla(4,90%,52%,0.5)" : "hsla(0,0%,18%,0.7)"}`,
                            color: selectedCategory === cat ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))",
                            boxShadow: selectedCategory === cat ? "0 0 20px hsla(4,90%,52%,0.2)" : "none",
                          }}
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {keys.map((key) => (
                        <motion.button
                          key={key}
                          onClick={() => handleKey(key)}
                          whileTap={{ scale: 0.91 }}
                          className="h-14 rounded-xl font-display text-lg font-semibold"
                          style={{
                            background: "hsla(0,0%,9%,0.9)",
                            border: "1px solid hsla(0,0%,16%,0.6)",
                            color: "hsl(var(--foreground))",
                          }}
                        >
                          {key === "backspace" ? "⌫" : key}
                        </motion.button>
                      ))}
                    </div>

                    <motion.button
                      onClick={handleAdd}
                      disabled={!isValid || loading}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-[0.2em] uppercase"
                      style={{
                        background: isValid
                          ? "linear-gradient(135deg, hsl(4,90%,50%) 0%, hsl(0,85%,40%) 100%)"
                          : "hsla(0,0%,10%,0.8)",
                        color: isValid ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))",
                        border: isValid ? "none" : "1px solid hsla(0,0%,15%,0.6)",
                        boxShadow: isValid ? "0 4px 30px hsla(4,90%,52%,0.3), 0 1px 0 hsla(0,0%,100%,0.08) inset" : "none",
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? "Recording..." : "Record Expense"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddExpense;
