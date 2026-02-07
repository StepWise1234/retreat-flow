import { motion } from 'framer-motion';
import heroImg from '@/assets/flight-school-hero.png';

export default function PaceSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-24 md:py-32">
        {/* Left text — small */}
        <motion.p
          className="hidden md:block flex-shrink-0 max-w-[10rem] text-xs leading-relaxed text-muted-foreground text-right mr-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          Follow the pace of your system as you metabolize nervous system shifts
        </motion.p>

        {/* Center — circle + person */}
        <div className="relative flex items-center justify-center">
          {/* Circle ring — fades in and expands first */}
          <motion.div
            className="absolute h-72 w-72 rounded-full border-2 border-border/50 sm:h-80 sm:w-80 md:h-96 md:w-96"
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Person image — fades in and slides up second */}
          <motion.div
            className="relative h-64 w-64 overflow-hidden rounded-full sm:h-72 sm:w-72 md:h-[22rem] md:w-[22rem]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={heroImg}
              alt="Retreat setting"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        {/* Right text — large */}
        <motion.p
          className="hidden md:block flex-shrink-0 max-w-[12rem] text-4xl lg:text-5xl font-semibold leading-none tracking-tight text-foreground ml-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          Less is more.
        </motion.p>

        {/* Mobile: text below circle */}
        <div className="md:hidden absolute bottom-6 left-0 right-0 px-6">
          <motion.p
            className="text-center text-2xl font-semibold text-foreground mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Less is more.
          </motion.p>
          <motion.p
            className="text-center text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            Follow the pace of your system as you metabolize nervous system shifts
          </motion.p>
        </div>
      </div>
    </section>
  );
}
