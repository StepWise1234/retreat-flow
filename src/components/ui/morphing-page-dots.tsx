"use client";

import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === page;
        return (
          <motion.button
            key={i}
            className="relative cursor-pointer rounded-full bg-white/30"
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
  );
}
