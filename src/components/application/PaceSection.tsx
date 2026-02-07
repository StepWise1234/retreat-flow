import { motion } from 'framer-motion';
import heroImg from '@/assets/flight-school-hero.png';

export default function PaceSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-20 md:flex-row md:gap-16 md:py-28">
        {/* Text */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Follow the pace
            <br />
            of your system.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stay regulated as you metabolize
            <br className="hidden sm:block" />
            nervous system shifts.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* Subtle ring accent */}
          <div className="absolute h-72 w-72 rounded-full border border-border/40 sm:h-80 sm:w-80 md:h-96 md:w-96" />

          {/* Circular image */}
          <div className="relative h-64 w-64 overflow-hidden rounded-full sm:h-72 sm:w-72 md:h-[22rem] md:w-[22rem]">
            <img
              src={heroImg}
              alt="Retreat setting"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
