import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  redAccent?: boolean;
}

const PremiumCard = ({ children, className = "", delay = 0, redAccent = false }: PremiumCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative overflow-hidden rounded-2xl carbon-texture ${className}`}
      style={{
        background: "linear-gradient(145deg, hsl(0,0%,9%) 0%, hsl(0,0%,6%) 60%, hsl(0,0%,5%) 100%)",
        boxShadow: redAccent
          ? "0 1px 0 0 hsla(4,90%,52%,0.12) inset, 0 0 0 1px hsla(0,0%,100%,0.05) inset, 0 12px 40px -8px rgba(0,0,0,0.6), 0 0 40px -10px hsla(4,90%,52%,0.12)"
          : "0 1px 0 0 hsla(0,0%,100%,0.05) inset, 0 0 0 1px hsla(0,0%,100%,0.04) inset, 0 12px 40px -8px rgba(0,0,0,0.6)",
        border: "1px solid hsl(0,0%,13%)",
      }}
    >
      {/* Top reflective edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsla(0,0%,100%,0.06) 25%, hsla(0,0%,100%,0.14) 50%, hsla(0,0%,100%,0.06) 75%, transparent 100%)",
        }}
      />
      {/* Red accent line at top if redAccent */}
      {redAccent && (
        <div
          className="absolute top-0 left-6 right-6 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, hsla(4,90%,52%,0.6) 40%, hsla(4,90%,52%,0.8) 50%, hsla(4,90%,52%,0.6) 60%, transparent 100%)",
          }}
        />
      )}
      {/* Inner shine */}
      <div
        className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, hsla(0,0%,100%,0.02) 0%, transparent 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default PremiumCard;
