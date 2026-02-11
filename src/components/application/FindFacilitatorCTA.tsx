import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import facilitatorImage from '@/assets/facilitator-silhouette.png';

export default function FindFacilitatorCTA() {
  return (
    <section className="relative bg-background overflow-hidden -mt-16 md:-mt-24">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 py-8 md:py-0 min-h-[60vh]">

        {/* Left — Text CTAs (desktop) */}
        <motion.div
          className="hidden md:flex absolute left-16 lg:left-28 top-[55%] -translate-y-1/2 flex-col gap-8 z-10"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            to="/facilitators"
            className="flex items-center gap-4 group cursor-pointer"
          >
            <motion.div whileHover={{ x: 6 }} className="flex items-center gap-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
                Find a<br />Facilitator
              </h2>
              <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-2 shrink-0" />
            </motion.div>
          </Link>

          <Link
            to="/apply"
            className="flex items-center gap-3 group cursor-pointer"
          >
            <motion.div whileHover={{ x: 6 }} className="flex items-center gap-3">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: '#FF4500' }}>
                Apply for Training
              </h3>
              <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all duration-300 group-hover:translate-x-2 shrink-0" style={{ color: '#FF4500' }} />
            </motion.div>
          </Link>
        </motion.div>

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

        {/* Mobile — Text CTAs below */}
        <motion.div
          className="md:hidden absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-10 px-6"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        >
          <Link to="/facilitators" className="flex items-center gap-3 group cursor-pointer">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Find a Facilitator
            </h2>
            <ArrowRight className="h-7 w-7 text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-2 shrink-0" />
          </Link>
          <Link to="/apply" className="flex items-center gap-2 group cursor-pointer">
            <h3 className="text-xl font-bold tracking-tight" style={{ color: '#FF4500' }}>
              Apply for Training
            </h3>
            <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-2 shrink-0" style={{ color: '#FF4500' }} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
