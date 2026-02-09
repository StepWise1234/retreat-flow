import { motion } from 'framer-motion';
import { Shield, Timer, Brain } from 'lucide-react';

const DOT_COLORS = ['#FFA500', '#FF4500', '#800080'];

function StepWiseLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1.5">
        {DOT_COLORS.map((color, i) => (
          <motion.span
            key={i}
            className="block h-3 w-3 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
      <motion.span
        className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        StepWise
      </motion.span>
    </div>
  );
}

const PILLARS = [
  {
    icon: Shield,
    heading: 'Safe because it tracks your pace',
    body: "StepWise follows the nervous system's own rhythm \u2014 never pushing past what your body is ready to process. Safety isn't a precaution; it's the method.",
    accentColor: DOT_COLORS[0],
  },
  {
    icon: Timer,
    heading: 'As short as a session, or as long as you need',
    body: "Whether it's a single therapy session or an extended journey, StepWise scales to your timeline. The work meets you exactly where you are.",
    accentColor: DOT_COLORS[1],
  },
  {
    icon: Brain,
    heading: 'Daily consciousness, integration in session',
    body: 'Awareness stays with you between sessions while deep integration unfolds within them. Everyday life becomes the practice; the session becomes the catalyst.',
    accentColor: DOT_COLORS[2],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function StepWiseSection() {
  return (
    <section className="relative bg-black overflow-hidden">
      {/* Subtle radial glow behind logo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/[0.02] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28">
        {/* Logo */}
        <div className="flex justify-center mb-14">
          <StepWiseLogo />
        </div>

        {/* Pillar cards */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 transition-colors duration-500 hover:bg-white/[0.04]"
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-40"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${pillar.accentColor}, transparent)`,
                  }}
                />

                {/* Icon */}
                <div
                  className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${pillar.accentColor}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: pillar.accentColor }} />
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-white leading-snug mb-3">
                  {pillar.heading}
                </h3>
                <p className="text-sm leading-relaxed text-white/50">
                  {pillar.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom sage divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(160_30%_72%/0.3)] to-transparent" />
    </section>
  );
}
