import { memo } from "react";
import { motion } from "framer-motion";
import PremiumCard from "./PremiumCard";

const DisciplineScore = memo(() => {
  const score = 85;
  const circumference = 2 * Math.PI * 46;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <PremiumCard className="p-5" delay={0.15} redAccent>
      <div className="flex flex-col items-center">
        <div className="relative w-[118px] h-[118px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
            {/* Background track */}
            <circle
              cx="54" cy="54" r="46"
              fill="none"
              stroke="hsla(0,0%,15%,0.8)"
              strokeWidth="5"
            />
            {/* Score arc — F1 red gradient */}
            <defs>
              <linearGradient id="scoreGradF1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(4, 90%, 62%)" />
                <stop offset="100%" stopColor="hsl(0, 85%, 42%)" />
              </linearGradient>
              <filter id="redGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.circle
              cx="54" cy="54" r="46"
              fill="none"
              stroke="url(#scoreGradF1)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              filter="url(#redGlow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </svg>
          {/* Red glow ring */}
          <div
            className="absolute inset-2 rounded-full pointer-events-none"
            style={{ boxShadow: "0 0 28px hsla(4,90%,52%,0.1)" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-hero text-[2.4rem] leading-none"
              style={{ color: "hsl(var(--text-hero))" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              {score}
            </motion.span>
            <span className="text-[9px] font-display font-semibold tracking-widest text-text-tertiary text-center leading-tight mt-1 uppercase">
              Discipline
            </span>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
});

export default DisciplineScore;
