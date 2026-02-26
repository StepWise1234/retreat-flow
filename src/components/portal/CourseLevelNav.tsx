import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const levels = [
  {
    id: 'beginning',
    title: 'Beginning',
    color: '#FFA500',
    subtitle: 'Nervous System Foundations',
    description:
      'Where every practitioner starts — and where the most important skills are forged. Beginning-level training grounds you in the science of titrated, sub-perceptual 5-MeO-DMT administration. You\'ll learn to read the nervous system in real time, recognize micro-signals of capacity, and guide clients through ultra-low dose sessions where safety and trust are the only objectives.',
    details: [
      'Ultra-low dose protocols with sub-perceptual thresholds',
      'Advanced somatic tracking through emotional release cycles',
      'Building the therapeutic container: safety, trust, attunement',
      'Contraindication screening & client readiness assessment',
      'Foundational breathwork & co-regulation techniques',
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    color: '#FF4500',
    subtitle: 'Specialty Workshops',
    description:
      'Once your foundation is solid, Intermediate training lets you deepen through specialty weekend workshops. Choose the areas that match your clinical interests and client needs — each workshop is a self-contained immersion designed to expand your toolkit in a specific domain.',
    details: [
      'Advanced protocols for dysregulated nervous systems & complex trauma',
      'Somatic touch techniques integrated with parts-work (IFS-informed)',
      'Attachment wound repair through the relational field',
      'Group facilitation with multi-threaded relational tracking',
      'Energy work modalities & subtle energetic attunement',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    color: '#800080',
    subtitle: 'Full-Release Mastery',
    description:
      'The culmination of the StepWise path. Advanced training prepares you for full-release 5-MeO-DMT sessions — the most profound and demanding work in the field. By this stage, your nervous system has been trained alongside your clinical skills. You\'ll learn to facilitate complete ego-dissolution experiences with the confidence that comes from hundreds of hours of graduated practice.',
    details: [
      'Full-release session facilitation with complete dissolution protocols',
      'Crisis navigation & deep-state support techniques',
      'Post-session integration frameworks for transformative experiences',
      'Supervision & mentorship pathway to trainer certification',
      'Contributing to the evolving StepWise evidence base',
    ],
  },
];

interface CourseLevelNavProps {
  currentLevel: string;
}

export default function CourseLevelNav({ currentLevel }: CourseLevelNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeLevel = levels.find((l) => l.id === activeId) ?? null;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6">
      <div className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          {/* Three circles */}
          <div className="flex justify-center gap-12 sm:gap-16 md:gap-20 mb-4">
            {levels.map((level, i) => {
              const isActive = activeId === level.id;
              const isCurrent = currentLevel === level.id;

              return (
                <motion.button
                  key={level.id}
                  onClick={() => setActiveId(isActive ? null : level.id)}
                  className="flex flex-col items-center gap-2.5 group cursor-pointer bg-transparent border-none outline-none"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <motion.span
                    className="relative block h-10 w-10 sm:h-12 sm:w-12 rounded-full transition-shadow duration-300"
                    style={{
                      backgroundColor: level.color,
                      boxShadow: isCurrent ? `0 0 0 3px ${level.color}30, 0 4px 12px ${level.color}25` : undefined,
                    }}
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
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.span>

                  <span
                    className="text-sm sm:text-base font-semibold tracking-tight transition-colors duration-200"
                    style={{ color: isActive || isCurrent ? level.color : undefined }}
                  >
                    <span className={isActive || isCurrent ? '' : 'text-foreground/50 group-hover:text-foreground/75 transition-colors duration-200'}>
                      {level.title}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Descriptor */}
          <motion.p
            className="text-sm text-foreground/30 text-center"
            animate={{ opacity: activeLevel ? 0.4 : 1 }}
            transition={{ duration: 0.3 }}
          >
            Tap a circle to explore each level of training.
          </motion.p>
        </div>

        {/* Expanded content */}
        <motion.div
          animate={{ height: activeLevel ? 'auto' : 0, opacity: activeLevel ? 1 : 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {activeLevel && (
              <motion.div
                key={activeLevel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="px-6 pb-6 pt-2 space-y-4 border-t border-foreground/[0.06]"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: activeLevel.color }}>
                    {activeLevel.subtitle}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/85">
                    {activeLevel.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base leading-[1.8] text-foreground/50">
                  {activeLevel.description}
                </p>
                <ul className="grid gap-2 pt-1">
                  {activeLevel.details.map((detail, i) => (
                    <motion.li
                      key={detail}
                      className="flex items-start gap-2.5 text-foreground/60"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: activeLevel.color }} />
                      <span className="text-sm leading-relaxed">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
