import { motion } from 'framer-motion';

/* ─── Inline accent circle — matches hero's solid circles ─── */
function AccentCircle({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full align-middle ${className ?? ''}`}
      style={{ backgroundColor: color }}
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
  title,
  description,
  delay,
  accentColor,
}: {
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
      <span
        className="block h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full"
        style={{ backgroundColor: accentColor }}
      />
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

        {/* ── Editorial copy — dots left-aligned, text to the right ── */}
        <div className="space-y-14">
          {/* Opening — orange dot left, text right */}
          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="mt-1.5 shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#FFA500' }} />
            <p className="text-base sm:text-lg leading-[1.9] text-foreground/60">
              Across thousands engaged in psychedelic-assisted therapy, a consistent pattern emerges:
            </p>
          </motion.div>

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

          {/* Pivot statement — red-orange */}
          <motion.p
            className="text-base sm:text-lg leading-[1.9] font-medium"
            style={{ color: '#FF4500' }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            The problem wasn't access to transformation. It's the absence of structured systems to support it.
          </motion.p>

          {/* Resolution — color-cycling dot left, text right */}
          <motion.div
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="mt-1.5 shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full animate-[brandCycle_4s_ease-in-out_infinite]"
            />
            <p className="text-base sm:text-lg leading-[1.9] text-foreground/75 font-medium">
              StepWise offers a ready-made framework for capacity-based, nervous-system-informed practice.
            </p>
          </motion.div>
        </div>

        {/* ── Three pillars ── */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <Pillar
            title="Safe"
            description="Tracks the nervous system's pace — honoring your body's natural rhythm for processing and repair."
            delay={0}
            accentColor="#FFA500"
          />
          <Pillar
            title="Adjustable"
            description="As short as your therapy session or as long as you need. The structure adapts to your timeline."
            delay={0.12}
            accentColor="#FF4500"
          />
          <Pillar
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
