import { motion } from 'framer-motion';
import silhouetteImg from '@/assets/pace-silhouette.png';

export default function PaceSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-24 md:py-32 min-h-[70vh]">

        {/* Left text — small body copy */}
        <motion.p
          className="hidden md:block absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 max-w-[11rem] text-sm leading-relaxed text-muted-foreground text-right z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          Learn the pace of your system as you expand regulation capacity, metabolize shifts, and repair wholeness.
        </motion.p>

        {/* Center composition — circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center">
          {/* Celadon circle — fades in and expands first */}
          <motion.div
            className="absolute h-72 w-72 rounded-full sm:h-80 sm:w-80 md:h-[26rem] md:w-[26rem]"
            style={{
              left: '-10%',
              top: '-5%',
              backgroundColor: 'hsl(160 30% 72%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Silhouette — mix-blend-mode removes white bg */}
          <motion.div
            className="relative z-10 h-[22rem] w-[18rem] sm:h-[26rem] sm:w-[22rem] md:h-[32rem] md:w-[26rem]"
            style={{ mixBlendMode: 'multiply' }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={silhouetteImg}
              alt="Calm silhouette profile with eyes closed"
              className="h-full w-full object-contain object-bottom"
            />
          </motion.div>
        </div>

        {/* Right text — bold, large "less is more" */}
        <motion.p
          className="hidden md:block absolute right-[20%] lg:right-[22%] top-1/2 -translate-y-1/3 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          less is
          <br />
          more
        </motion.p>

        {/* Mobile: text below */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 px-6 text-center z-10">
          <motion.p
            className="text-3xl font-bold text-foreground mb-2 tracking-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            less is more
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            Learn the pace of your system as you expand regulation capacity, metabolize shifts, and repair wholeness.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
