import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const levels = [
  {
    id: 'beginning',
    title: 'Beginning',
    accentColor: '#FFA500',
    subtitle: 'Complete Foundations',
    description:
      'Where every practitioner starts — and where the most important skills are forged. Beginning-level training is a complete foundation, covering everything from sub-perceptual micro-dosing to moderate-dose protocols and full-embrace sessions. You\'ll learn to read the nervous system in real time, recognize micro-signals of capacity, track somatic markers through emotional release cycles, and guide clients through progressively deeper experiences where safety, trust, and integration are the constant priorities.',
    details: [
      'Sub-perceptual through full-release dose protocols & titration techniques',
      'Somatic marker recognition, real-time nervous system tracking & co-regulation',
      'Building the therapeutic container: safety, trust, attunement',
      'Contraindication screening, client readiness & progressive capacity building',
      'Working with resistance, dissociation & trauma responses',
      'Multi-session arc design, peer consultation & supervised client sessions',
    ],
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    accentColor: '#FF4500',
    subtitle: 'Specialty Weekend Workshops',
    description:
      'With your complete foundation in place, deepen your expertise through focused specialty intensives. Choose from three weekend workshops — each designed to sharpen a specific clinical edge. These are not sequential; pick the area that calls to your practice, or take all three over time.',
    details: [
      '1) Nervous System + PTSD — Advanced autonomic mapping, trauma-loop interruption & titrated re-processing',
      '2) Touch + Parts-Work — Somatic touch protocols, wounded inner-child dialogue & parts integration',
      '3) Relational Intelligence — Attachment-wound repair, co-regulation dynamics & relational field tracking',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced',
    accentColor: '#800080',
    subtitle: 'Full-Release Mastery',
    description:
      'The culmination of the StepWise path. Advanced training prepares you for full-release 5-MeO-DMT sessions — the most profound and demanding work in the field. By this stage, your nervous system has been trained alongside your clinical skills. You\'ll learn to facilitate complete ego-dissolution experiences with the confidence that comes from hundreds of hours of graduated practice. This is where art meets science.',
    details: [
      'Full-release session facilitation with complete dissolution protocols',
      'Crisis navigation & deep-state support techniques',
      'Post-session integration frameworks for transformative experiences',
      'Supervision & mentorship pathway to trainer certification',
      'Contributing to the evolving StepWise evidence base',
    ],
  },
];

export default function MasteryLevels() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeLevel = levels.find((l) => l.id === activeId) ?? null;

  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
        {/* Section heading */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground/85 text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Three Levels of Mastery
        </motion.h2>
        <motion.p
          className="text-center text-lg text-foreground/50 mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Each level builds on the last — expanding your capacity to match the depth of the work.
        </motion.p>

        {/* Interactive circles */}
        <div className="flex justify-center gap-16 sm:gap-20 md:gap-28 mb-16">
          {levels.map((level, i) => {
            const isActive = activeId === level.id;

            return (
              <motion.button
                key={level.id}
                onClick={() => setActiveId(isActive ? null : level.id)}
                className="flex flex-col items-center gap-4 group cursor-pointer bg-transparent border-none outline-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="relative block h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full transition-shadow duration-300"
                  style={{ backgroundColor: level.accentColor }}
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
                  style={{ color: isActive ? level.accentColor : undefined }}
                >
                  <span className={isActive ? '' : 'text-foreground/60 group-hover:text-foreground/90 transition-colors duration-200'}>
                    {level.title}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Content area */}
        <motion.div
          animate={{ height: activeLevel ? 'auto' : 60 }}
          initial={false}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {activeLevel ? (
              <motion.div
                key={activeLevel.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: activeLevel.accentColor }}>
                    {activeLevel.subtitle}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground/85">
                    {activeLevel.title}
                  </h3>
                </div>
                <p className="text-lg leading-[1.8] text-foreground/55">
                  {activeLevel.description}
                </p>
                <ul className="grid gap-3 pt-2">
                  {activeLevel.details.map((detail, i) => (
                    <motion.li
                      key={detail}
                      className="flex items-start gap-3 text-foreground/65"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activeLevel.accentColor }} />
                      <span className="text-base leading-relaxed">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.p
                key="default"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl leading-[1.9] text-foreground/50 text-center max-w-xl mx-auto"
              >
                Tap a circle above to explore each level of StepWise mastery.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
