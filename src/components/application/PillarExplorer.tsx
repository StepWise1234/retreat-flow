import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pillars = [
  {
    id: 'safe',
    title: 'Safe',
    accentColor: '#FFA500',
    subtitle: 'Your Nervous System Leads',
    description:
      'Imagine a space where your body sets the pace. Not a clock, not a protocol, not someone else\'s idea of "ready." StepWise tracks the subtle language of your nervous system in real time, honoring each micro-signal of capacity. You never outrun your own ability to process. The result is a depth of safety that lets you open fully, because your body knows.',
    details: [
      'Sessions paced by somatic markers, never arbitrary timelines',
      'Continuous nervous system monitoring by a trained facilitator',
      'Sub-perceptual entry points that let your system acclimate gently',
      'Built-in pauses for integration before deepening',
    ],
  },
  {
    id: 'adjustable',
    title: 'Adjustable',
    accentColor: '#FF4500',
    subtitle: 'Your Timeline, Your Depth',
    description:
      'No two journeys look the same, and they shouldn\'t. StepWise scales to meet you exactly where you are, whether that\'s a single focused session or an extended arc of discovery. You choose the depth. You choose when to pause, when to explore further, and when to stop. The structure holds, but it bends around your life, not the other way around.',
    details: [
      'From a single integration window to an extended stabilization arc',
      'You control how deep you go with each layered draw',
      'Flexible session length, as short or as long as you need',
      'Progressive capacity building that respects your unique rhythm',
    ],
  },
  {
    id: 'integrative',
    title: 'Integrative',
    accentColor: '#800080',
    subtitle: 'Insights You Can Live',
    description:
      'Most psychedelic experiences deliver breakthroughs that fade by morning. StepWise is different. Because daily consciousness is maintained throughout, insights don\'t wait for a debrief. They become part of your lived experience as they emerge. You walk away not with memories of a trip, but with neural pathways already rewired toward the life you actually want.',
    details: [
      'Full awareness maintained, no "coming back" required',
      'Real-time processing of emotion, sensation, and meaning',
      'Insights integrate as they arise, not days later',
      'Lasting transformation rooted in embodied experience',
    ],
  },
];

export default function PillarExplorer() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePillar = pillars.find((p) => p.id === activeId) ?? null;

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          animate={{ paddingTop: activePillar ? '5rem' : '2.5rem', paddingBottom: activePillar ? '5rem' : '2.5rem' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section heading */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground/85 text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Three Pillars of StepWise
          </motion.h2>
          <motion.p
            className="text-center text-lg text-foreground/50 mb-16 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            A framework built around your nervous system — not a one-size-fits-all protocol.
          </motion.p>

          {/* Interactive circles */}
          <div className="flex justify-center gap-12 sm:gap-16 md:gap-20 mb-8">
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
                  <motion.span
                    className="relative block h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full transition-shadow duration-300"
                    style={{ backgroundColor: pillar.accentColor }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, rotate: -90 }}
                          animate={{ opacity: 1, rotate: 0 }}
                          exit={{ opacity: 0, rotate: 90 }}
                          transition={{ duration: 0.25 }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>

                  <span
                    className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight transition-colors duration-200"
                    style={{ color: isActive ? pillar.accentColor : undefined }}
                  >
                    <span className={isActive ? '' : 'text-foreground/60 group-hover:text-foreground/90 transition-colors duration-200'}>
                      {pillar.title}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Content area — smooth height expansion */}
          <motion.div
            animate={{ height: activePillar ? 'auto' : 0, opacity: activePillar ? 1 : 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {activePillar && (
                <motion.div
                  key={activePillar.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6 pt-8"
                >
                  <div>
                    <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: activePillar.accentColor }}>
                      {activePillar.subtitle}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground/85">
                      {activePillar.title}
                    </h3>
                  </div>
                  <p className="text-lg leading-[1.8] text-foreground/55">
                    {activePillar.description}
                  </p>
                  <ul className="grid gap-3 pt-2">
                    {activePillar.details.map((detail, i) => (
                      <motion.li
                        key={detail}
                        className="flex items-start gap-3 text-foreground/65"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                      >
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activePillar.accentColor }} />
                        <span className="text-base leading-relaxed">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
