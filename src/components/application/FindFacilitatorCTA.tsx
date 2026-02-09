import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import facilitatorImage from '@/assets/facilitator-silhouette.png';

export default function FindFacilitatorCTA() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-8 md:py-0 min-h-[70vh]">

        {/* Left — Text CTA */}
        <motion.a
          href="#"
          className="hidden md:flex absolute left-16 lg:left-28 top-[55%] -translate-y-1/2 items-center gap-4 group cursor-pointer z-10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: 6 }}
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            Find a<br />Facilitator
          </h2>
          <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-2 shrink-0" />
        </motion.a>

        {/* Center composition — purple circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center md:translate-x-[250px]">
          {/* Purple circle — same size & offset as hero */}
          <motion.div
            className="absolute h-[15.6rem] w-[15.6rem] rounded-full sm:h-[17.7rem] sm:w-[17.7rem] md:h-[23.1rem] md:w-[23.1rem]"
            style={{
              left: 'calc(50% - 200px)',
              top: 'calc(50% - 200px)',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#800080',
            }}
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Silhouette — same size as hero images */}
          <motion.div
            className="relative z-10 h-[28rem] w-[23.2rem] sm:h-[33.6rem] sm:w-[28rem] md:h-[40.8rem] md:w-[33.6rem]"
            style={{ mixBlendMode: 'multiply' }}
            initial={{ opacity: 0, scale: 1.04 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={facilitatorImage}
              alt="Silhouette of a middle-aged male with eyes closed in a relaxed state"
              className="h-full w-full object-contain object-bottom"
            />
          </motion.div>
        </div>

        {/* Mobile — Text CTA below */}
        <motion.a
          href="#"
          className="md:hidden absolute bottom-8 left-0 right-0 flex items-center justify-center gap-3 group cursor-pointer z-10 px-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Find a Facilitator
          </h2>
          <ArrowRight className="h-7 w-7 text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-2 shrink-0" />
        </motion.a>
      </div>
    </section>
  );
}
