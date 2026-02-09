import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Pillar data ─── */
const pillars = [
  {
    id: 'safe',
    title: 'Safe',
    accentColor: '#FFA500',
    description:
      'StepWise tracks the nervous system\'s pace — honoring your body\'s natural rhythm for processing and repair. Sessions are guided by somatic markers, not arbitrary timelines, so you never outrun your own capacity.',
  },
  {
    id: 'adjustable',
    title: 'Adjustable',
    accentColor: '#FF4500',
    description:
      'As short as your therapy session or as long as you need. The structure adapts to your timeline — scaling from a single integration window to an extended stabilization arc without losing coherence.',
  },
  {
    id: 'integrative',
    title: 'Integrative',
    accentColor: '#800080',
    description:
      'Daily consciousness is maintained throughout, enabling real-time integration during session. Insights don\'t wait for a debrief — they become part of your lived experience as they emerge.',
  },
];


export default function ProblemSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePillar = pillars.find((p) => p.id === activeId) ?? null;

  return (
    <section className="relative bg-background overflow-hidden">
        <div className="relative mx-auto max-w-2xl px-6 py-16 md:py-24">

        {/* ── Swappable text area ── */}
        <div className="min-h-[260px] sm:min-h-[240px]">
          <AnimatePresence mode="wait">
            {activePillar ? (
              /* ─ Pillar detail view ─ */
              <motion.div
                key={activePillar.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <h3
                  className="text-3xl sm:text-4xl font-semibold tracking-tight"
                  style={{ color: activePillar.accentColor }}
                >
                  {activePillar.title}
                </h3>
                <p className="text-lg sm:text-xl leading-[1.9] text-foreground/60">
                  {activePillar.description}
                </p>
              </motion.div>
            ) : (
              /* ─ Default editorial copy ─ */
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-14"
              >
                {/* Opening */}
                <motion.div
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mt-1.5 shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#FFA500' }} />
                   <p className="text-lg sm:text-xl leading-[1.9] text-foreground/60">
                     Across thousands engaged in psychedelic-assisted therapy, a consistent pattern emerges:
                  </p>
                </motion.div>

                {/* Core insight */}
                <motion.p
                  className="text-lg sm:text-xl leading-[1.9] text-foreground/60 pl-5 md:pl-8 border-l-[3px]"
                  style={{ borderColor: '#FF4500' }}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  People access profound insight but lack the nervous system capacity required to stabilize
                  those experiences into identity, behavior, and life direction.
                </motion.p>

                {/* Pivot */}
                <motion.p
                  className="text-lg sm:text-xl leading-[1.9]"
                  style={{ color: '#FF4500' }}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  The problem wasn't access to transformation. It's the absence of structured systems to support it.
                </motion.p>

                {/* Resolution */}
                <motion.p
                  className="text-lg sm:text-xl leading-[1.9] font-medium"
                  style={{ color: '#800080' }}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  StepWise offers a ready-made framework for capacity-based, nervous-system-informed practice.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Interactive pillar circles ── */}
        <div className="mt-20 flex justify-center gap-12 sm:gap-16 md:gap-20">
          {pillars.map((pillar, i) => {
            const isActive = activeId === pillar.id;

            return (
              <motion.button
                key={pillar.id}
                onClick={() => setActiveId(isActive ? null : pillar.id)}
                className="flex flex-col items-center gap-4 group cursor-pointer bg-transparent border-none outline-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Circle — acts as open/close toggle */}
                <motion.span
                  className="relative block h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full transition-shadow duration-300"
                  style={{ backgroundColor: pillar.accentColor }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  {/* X icon when active */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.25 }}
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="6" y1="6" x2="18" y2="18" />
                          <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>

                {/* Label */}
                <span
                  className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight transition-colors duration-200"
                  style={{ color: isActive ? pillar.accentColor : undefined }}
                >
                  <span className={isActive ? '' : 'text-foreground/70 group-hover:text-foreground transition-colors duration-200'}>
                    {pillar.title}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
