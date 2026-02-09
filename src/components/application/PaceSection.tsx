import { motion } from 'framer-motion';
import silhouetteImg from '@/assets/pace-silhouette.png';

export default function PaceSection() {
  return (
    <section className="relative bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-24 md:pt-32 pb-0 min-h-[70vh]">

        {/* Left text — small body copy */}
        <motion.p
          className="hidden md:block absolute left-6 lg:left-12 top-[45%] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          Learn the pace of your system as you expand regulation capacity, metabolize shifts, and repair wholeness.
        </motion.p>

        {/* Center composition — circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center">
          {/* Celadon circle */}
          <div
            className="absolute h-[23rem] w-[23rem] rounded-full sm:h-[26rem] sm:w-[26rem] md:h-[34rem] md:w-[34rem]"
            style={{
              left: 'calc(-10% + 95px)',
              top: '130px',
              backgroundColor: 'hsl(160 30% 72%)',
            }}
          />

          {/* Silhouette — mix-blend-mode removes white bg */}
          <div
            className="relative z-10 h-[35rem] w-[29rem] sm:h-[42rem] sm:w-[35rem] md:h-[51rem] md:w-[42rem]"
            style={{ mixBlendMode: 'multiply' }}
          >
            <img
              src={silhouetteImg}
              alt="Calm silhouette profile with eyes closed"
              className="h-full w-full object-contain object-bottom translate-y-8"
            />
          </div>
        </div>

        {/* Right text — bold, large "less is more" */}
        <motion.p
          className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[45%] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10"
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
            className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto"
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
