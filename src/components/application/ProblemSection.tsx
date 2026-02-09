import { motion } from 'framer-motion';
import { Shield, Timer, Brain } from 'lucide-react';

/* ─── Brand circle — decorative background orb ─── */
function BrandOrb({
  color,
  size,
  blur = 60,
  opacity = 0.08,
  className,
}: {
  color: string;
  size: number;
  blur?: number;
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

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
      {/* ── Large ambient orbs ── */}
      <BrandOrb color="#FFA500" size={420} opacity={0.10} blur={70} className="top-12 -left-40 md:left-[8%]" />
      <BrandOrb color="#FF4500" size={360} opacity={0.10} blur={70} className="top-[40%] right-[-10%] md:right-[5%]" />
      <BrandOrb color="#800080" size={400} opacity={0.10} blur={70} className="bottom-20 left-[15%] md:left-[30%]" />

      {/* ── Smaller, sharper accent orbs near text ── */}
      <BrandOrb color="#FFA500" size={120} opacity={0.14} blur={30} className="top-[22%] left-[60%] md:left-[55%]" />
      <BrandOrb color="#FF4500" size={100} opacity={0.12} blur={25} className="top-[52%] left-[10%] md:left-[20%]" />
      <BrandOrb color="#800080" size={140} opacity={0.14} blur={28} className="bottom-[28%] right-[8%] md:right-[25%]" />

      <div className="relative mx-auto max-w-xl px-6 py-28 md:py-36">
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

        {/* ── Magazine-style editorial copy ── */}
        <div className="space-y-16">
          {/* Opening */}
          <motion.p
            className="text-base sm:text-lg leading-[1.8] text-foreground/65"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Across thousands engaged in psychedelic-assisted therapy, a consistent pattern emerges:
          </motion.p>

          {/* Core insight — indented with subtle left border */}
          <motion.p
            className="text-base sm:text-lg leading-[1.8] text-foreground/65 pl-4 md:pl-8 border-l-2 border-foreground/8"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            People access profound insight but lack the nervous system capacity required to stabilize
            those experiences into identity, behavior, and life direction.
          </motion.p>

          {/* Pivot statement */}
          <motion.p
            className="text-base sm:text-lg leading-[1.8] text-foreground/65"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            The problem wasn't access to transformation
            <span className="text-foreground/35"> — it's the absence of structured systems to support it.</span>
          </motion.p>

          {/* Resolution */}
          <motion.p
            className="text-base sm:text-lg leading-[1.8] text-foreground/80 font-medium"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            StepWise offers a ready-made framework for capacity-based, nervous-system-informed practice.
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
