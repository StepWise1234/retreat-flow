import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';

const phases = [
  {
    id: 'online',
    title: 'Online Class',
    accentColor: '#FFA500',
    subtitle: 'Foundation & Theory',
    description:
      'Begin your journey with a comprehensive online curriculum covering the science of nervous system regulation, capacity-based dosing theory, and the pharmacology of titrated 5-MeO-DMT. Weekly live sessions connect you with faculty and fellow trainees as you build the conceptual framework for safe, effective practice.',
    details: [
      'Self-paced video modules with somatic exercises',
      'Weekly live cohort sessions with Q&A',
      'Foundational neuroscience & psychopharmacology',
      'Case study analysis & ethical frameworks',
    ],
  },
  {
    id: 'retreat',
    title: 'In-Person Retreat',
    accentColor: '#FF4500',
    subtitle: 'Embodied Practice',
    description:
      'An immersive multi-day training where theory becomes lived experience. Under expert guidance, you will practice titrated administration protocols, develop somatic tracking skills, and deepen your capacity to hold space. Each session builds on the last — expanding your nervous system\'s bandwidth through direct, supported experience.',
    details: [
      'Hands-on titrated dosing protocols',
      'Somatic tracking & co-regulation practice',
      'Small-group facilitation exercises',
      'Personal capacity expansion sessions',
    ],
  },
  {
    id: 'mastery',
    title: 'Mastery Support',
    accentColor: '#800080',
    subtitle: 'Integration & Growth',
    description:
      'Your training doesn\'t end at the retreat. Ongoing mentorship, peer consultation groups, and advanced workshops ensure you continue to refine your craft. Access supervision hours, contribute to an evolving knowledge base, and join a community of practitioners committed to the highest standards of care.',
    details: [
      'Monthly group supervision & case consultation',
      'One-on-one mentorship with senior facilitators',
      'Advanced technique workshops',
      'Lifetime access to the practitioner community',
    ],
    comingSoon: {
      title: 'Coming Soon: StepWise App',
      description:
        'A secure, professional-grade platform built for the StepWise practitioner community. Access AI-supported session preparation tools, track participant capacity across progressive protocols, and maintain the documentation standards your practice demands — without the overhead. Beyond clinical support, the StepWise App connects you to a vetted network of fellow alumni: share case insights, coordinate peer consultation, and stay current with evolving protocols through a private, integrity-first community designed for practitioners who hold themselves to the highest standard.',
    },
  },
];

export default function TrainingPhases() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activePhase = phases.find((p) => p.id === activeId) ?? null;

  return (
    <section className="relative overflow-hidden bg-[#fafafa]">
      {/* Animated grid background */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.08}
          duration={4}
          className="w-full h-full fill-black/5 stroke-black/5"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
        {/* Section heading */}
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black/85 text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Three Phases of Training
        </motion.h2>
        <motion.p
          className="text-center text-lg text-black/50 mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          A structured path from foundational knowledge to embodied mastery.
        </motion.p>

        {/* Interactive circles */}
        <div className="flex justify-center gap-12 sm:gap-16 md:gap-20 mb-16">
          {phases.map((phase, i) => {
            const isActive = activeId === phase.id;

            return (
              <motion.button
                key={phase.id}
                onClick={() => setActiveId(isActive ? null : phase.id)}
                className="flex flex-col items-center gap-4 group cursor-pointer bg-transparent border-none outline-none"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="relative block h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full transition-shadow duration-300"
                  style={{ backgroundColor: phase.accentColor }}
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
                  style={{ color: isActive ? phase.accentColor : undefined }}
                >
                  <span className={isActive ? '' : 'text-black/60 group-hover:text-black/90 transition-colors duration-200'}>
                    {phase.title}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="min-h-[280px] sm:min-h-[260px]">
          <AnimatePresence mode="wait">
            {activePhase ? (
              <motion.div
                key={activePhase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div>
                  <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: activePhase.accentColor }}>
                    {activePhase.subtitle}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black/85">
                    {activePhase.title}
                  </h3>
                </div>
                <p className="text-lg leading-[1.8] text-black/55">
                  {activePhase.description}
                </p>
                <ul className="grid gap-3 pt-2">
                  {activePhase.details.map((detail, i) => (
                    <motion.li
                      key={detail}
                      className="flex items-start gap-3 text-black/65"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: activePhase.accentColor }} />
                      <span className="text-base leading-relaxed">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
                {'comingSoon' in activePhase && activePhase.comingSoon && (
                  <motion.div
                    className="mt-8 pt-6 border-t border-black/10"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <p className="text-lg font-semibold tracking-tight mb-2" style={{ color: '#800080' }}>
                      {(activePhase as any).comingSoon.title}
                    </p>
                    <p className="text-base leading-[1.8] text-black/50">
                      {(activePhase as any).comingSoon.description}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.p
                key="default"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg sm:text-xl leading-[1.9] text-black/50 text-center max-w-xl mx-auto"
              >
                Tap a circle above to explore each phase of the StepWise training journey.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
