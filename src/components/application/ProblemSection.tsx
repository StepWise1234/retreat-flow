import { motion } from 'framer-motion';
import { Shield, Timer, Brain } from 'lucide-react';

/* ─── StepWise logo with three signature dots ─── */
function StepWiseLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#FFA500' }} />
        <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#FF4500' }} />
        <span className="block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#800080' }} />
      </div>
      <span className="text-sm font-medium tracking-[0.25em] uppercase text-foreground/60">
        StepWise
      </span>
    </div>
  );
}

/* ─── Feature pillar ─── */
function Pillar({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-start gap-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03]">
        <Icon className="h-4.5 w-4.5 text-foreground/50" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-foreground/50">
        {description}
      </p>
    </motion.div>
  );
}

/* ─── Thin divider line ─── */
function Divider() {
  return (
    <div className="mx-auto w-full max-w-[4rem] h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
  );
}

export default function ProblemSection() {
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Subtle top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />

      <div className="mx-auto max-w-xl px-6 py-28 md:py-40">
        {/* Logo */}
        <motion.div
          className="mb-20 flex justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <StepWiseLogo />
        </motion.div>

        {/* ── Magazine layout with background circles ── */}
        <div className="relative space-y-16 md:space-y-20">

          {/* Orange circle — behind opener */}
          <div
            className="pointer-events-none absolute -left-32 top-4 h-64 w-64 rounded-full opacity-[0.07] blur-2xl"
            style={{ backgroundColor: '#FFA500' }}
          />

          {/* Opening line */}
          <motion.p
            className="relative text-base sm:text-lg leading-[1.85] text-foreground/70"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Across thousands engaged in psychedelic-assisted therapy, a consistent pattern emerges:
          </motion.p>

          {/* Red circle — behind core insight */}
          <div
            className="pointer-events-none absolute -right-28 top-1/3 h-72 w-72 rounded-full opacity-[0.06] blur-3xl"
            style={{ backgroundColor: '#FF4500' }}
          />

          {/* Core insight */}
          <motion.p
            className="relative text-base sm:text-lg leading-[1.85] text-foreground/70"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            People access profound insight but lack the nervous system capacity required to stabilize
            those experiences into identity, behavior, and life direction.
          </motion.p>

          {/* Divider */}
          <Divider />

          {/* Purple circle — behind pull-quote */}
          <div
            className="pointer-events-none absolute -left-24 bottom-1/3 h-80 w-80 rounded-full opacity-[0.06] blur-3xl"
            style={{ backgroundColor: '#800080' }}
          />

          {/* Pull-quote */}
          <motion.p
            className="relative text-base sm:text-lg leading-[1.85] text-foreground/70"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            The problem wasn't access to transformation
            <span className="text-foreground/40"> — it's the absence of structured systems to support it.</span>
          </motion.p>

          {/* Divider */}
          <Divider />

          {/* Closing — StepWise intro */}
          <motion.p
            className="relative text-base sm:text-lg leading-[1.85] text-foreground/70"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            StepWise offers a ready-made framework for capacity-based, nervous-system-informed practice.
          </motion.p>
        </div>

        {/* ── Three pillars ── */}
        <div className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <Pillar
            icon={Shield}
            title="Safe"
            description="Tracks the nervous system's pace — honoring your body's natural rhythm for processing and repair."
            delay={0}
          />
          <Pillar
            icon={Timer}
            title="Adjustable"
            description="As short as your therapy session or as long as you need. The structure adapts to your timeline."
            delay={0.12}
          />
          <Pillar
            icon={Brain}
            title="Integrative"
            description="Daily consciousness is maintained throughout, enabling real-time integration during session — not just after."
            delay={0.24}
          />
        </div>
      </div>

      {/* Subtle bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
    </section>
  );
}
