import { motion } from 'framer-motion';
import { Shield, Timer, Brain } from 'lucide-react';

/* ─── Inline accent circle — matches hero's solid circles ─── */
function AccentCircle({
  color,
  size = 28,
  className,
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full align-middle ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
}

/* ─── StepWise logo — matching "Training Application" font style ─── */
function StepWiseLogo() {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
        StepWise
      </h2>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#FFA500' }} />
        <span className="block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#FF4500' }} />
        <span className="block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#800080' }} />
      </div>
    </div>
  );
}

/* ─── Feature pillar ─── */
function Pillar({
  icon: Icon,
  title,
  description,
  delay,
  accentColor,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  delay: number;
  accentColor: string;
}) {
  return (
    <motion.div
      className="relative flex flex-col items-start gap-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: accentColor }} strokeWidth={1.5} />
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

export default function ProblemSection() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto max-w-xl px-6 py-28 md:py-36">
        {/* Logo */}
        <motion.div
          className="mb-24 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <StepWiseLogo />
        </motion.div>

        {/* ── Editorial copy with inline accent circles ── */}
        <div className="space-y-14">
          {/* Opening — orange dot as visual anchor */}
          <motion.p
            className="text-base sm:text-lg leading-[1.9] text-foreground/60"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <AccentCircle color="#FFA500" size={14} className="mr-2 -translate-y-px" />
            Across thousands engaged in psychedelic-assisted therapy, a consistent pattern emerges:
          </motion.p>

          {/* Core insight */}
          <motion.p
            className="text-base sm:text-lg leading-[1.9] text-foreground/60 pl-5 md:pl-8 border-l-[3px]"
            style={{ borderColor: '#FF4500' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            People access profound insight but lack the nervous system capacity required to stabilize
            those experiences into identity, behavior, and life direction.
          </motion.p>

          {/* Pivot statement — full orange */}
          <motion.p
            className="text-base sm:text-lg leading-[1.9] font-medium"
            style={{ color: '#FFA500' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            The problem wasn't access to transformation. It's the absence of structured systems to support it.
          </motion.p>

          {/* Resolution — ends with brand dots */}
          <motion.p
            className="text-base sm:text-lg leading-[1.9] text-foreground/75 font-medium"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            StepWise offers a ready-made framework for capacity-based, nervous-system-informed practice.
            {' '}
            <AccentCircle color="#FFA500" size={8} className="mx-0.5" />
            {' '}
            <AccentCircle color="#FF4500" size={8} className="mx-0.5" />
            {' '}
            <AccentCircle color="#800080" size={8} className="mx-0.5" />
          </motion.p>
        </div>

        {/* ── Three pillars ── */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <Pillar
            icon={Shield}
            title="Safe"
            description="Tracks the nervous system's pace — honoring your body's natural rhythm for processing and repair."
            delay={0}
            accentColor="#FFA500"
          />
          <Pillar
            icon={Timer}
            title="Adjustable"
            description="As short as your therapy session or as long as you need. The structure adapts to your timeline."
            delay={0.12}
            accentColor="#FF4500"
          />
          <Pillar
            icon={Brain}
            title="Integrative"
            description="Daily consciousness is maintained throughout, enabling real-time integration during session."
            delay={0.24}
            accentColor="#800080"
          />
        </div>
      </div>
    </section>
  );
}
