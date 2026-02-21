import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage = ({ onSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
      else setMessage("Check your email to verify your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) setError(error.message);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result?.error) setError(String(result.error));
  };

  const inputStyle = {
    background: "hsla(0,0%,8%,0.9)",
    border: "1px solid hsl(0,0%,16%)",
    color: "hsl(0,0%,95%)",
    borderRadius: "0.75rem",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Ambient glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, hsla(4,90%,52%,0.1) 0%, transparent 65%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1
            className="font-hero text-5xl tracking-widest mb-1"
            style={{ color: "hsl(var(--primary))" }}
          >
            STUD-FI
          </h1>
          <p className="font-display text-[10px] tracking-[0.35em] text-text-tertiary uppercase">
            Financial Discipline System
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "hsla(0,0%,7%,0.8)", border: "1px solid hsl(0,0%,12%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              className="flex-1 py-2.5 rounded-lg font-display text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-200"
              style={{
                background: mode === m
                  ? "linear-gradient(135deg, hsl(4,90%,48%), hsl(0,85%,38%))"
                  : "transparent",
                color: mode === m ? "hsl(0,0%,98%)" : "hsl(var(--text-tertiary))",
                boxShadow: mode === m ? "0 2px 16px hsla(4,90%,52%,0.25)" : "none",
              }}
            >
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 font-body text-sm outline-none placeholder:text-text-tertiary"
                    style={inputStyle}
                    maxLength={80}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 font-body text-sm outline-none placeholder:text-text-tertiary"
              style={inputStyle}
              maxLength={200}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3.5 font-body text-sm outline-none placeholder:text-text-tertiary"
              style={inputStyle}
              maxLength={128}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />
                : <Eye className="w-4 h-4" style={{ color: "hsl(var(--text-tertiary))" }} />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-xs text-center py-2 px-4 rounded-lg"
              style={{ color: "hsl(0,84%,65%)", background: "hsla(0,84%,52%,0.08)", border: "1px solid hsla(0,84%,52%,0.15)" }}
            >
              {error}
            </motion.p>
          )}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-body text-xs text-center py-2 px-4 rounded-lg"
              style={{ color: "hsl(4,90%,62%)", background: "hsla(4,90%,52%,0.08)", border: "1px solid hsla(4,90%,52%,0.2)" }}
            >
              {message}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-xl font-display font-bold text-sm tracking-[0.2em] uppercase mt-2"
            style={{
              background: "linear-gradient(135deg, hsl(4,90%,50%) 0%, hsl(0,85%,40%) 100%)",
              color: "hsl(0,0%,98%)",
              boxShadow: "0 4px 30px hsla(4,90%,52%,0.3)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "hsl(0,0%,13%)" }} />
          <span className="font-display text-[10px] tracking-widest text-text-tertiary uppercase">or</span>
          <div className="flex-1 h-px" style={{ background: "hsl(0,0%,13%)" }} />
        </div>

        {/* Google */}
        <motion.button
          onClick={handleGoogle}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3.5 rounded-xl font-display text-sm font-semibold tracking-wide flex items-center justify-center gap-3 transition-all"
          style={{
            background: "hsla(0,0%,8%,0.9)",
            border: "1px solid hsl(0,0%,16%)",
            color: "hsl(0,0%,80%)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </motion.button>

        <p className="text-center font-body text-[10px] text-text-tertiary mt-6 leading-relaxed">
          By continuing, you agree to STUD-FI's financial discipline terms.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
