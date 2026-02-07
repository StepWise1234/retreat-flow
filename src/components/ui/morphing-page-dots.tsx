"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MorphingPageDotsProps {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export default function MorphingPageDots({
  total,
  page,
  onPageChange,
}: MorphingPageDotsProps) {
  const goPrev = () => onPageChange(Math.max(0, page - 1));
  const goNext = () => onPageChange(Math.min(total - 1, page + 1));

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Left Arrow */}
      <button
        onClick={goPrev}
        disabled={page === 0}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/50 transition-all duration-200 hover:border-white/30 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Dots */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === page;
          return (
            <motion.button
              key={i}
              className="relative cursor-pointer rounded-full bg-white/25"
              onClick={() => onPageChange(i)}
              animate={{
                width: isActive ? 28 : 10,
                height: 10,
                borderRadius: 9999,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* Ripple effect for active dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: "hsl(160 30% 72%)" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        onClick={goNext}
        disabled={page === total - 1}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/50 transition-all duration-200 hover:border-white/30 hover:text-white/80 disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
