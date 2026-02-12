import { motion } from 'framer-motion';
import silhouette from '@/assets/facilitator-female-silhouette.png';

const imageVariants = {
  hidden: { opacity: 0, scale: 1.04 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const } },
};

const circleVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 } },
};

const textVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.5 } },
};

const descVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.7 } },
};

export default function FacilitatorHero() {
  return (
    <section className="relative bg-white">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-0 pb-8 md:pb-0 min-h-[70vh]">

        {/* Left text — description */}
        <motion.p
          className="hidden md:block absolute left-6 lg:left-12 top-[55%] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
          variants={descVariants}
          initial="hidden"
          animate="visible"
        >
          Connecting you with trained, capacity-based practitioners in jurisdictions where 5-MeO-DMT is permitted.
        </motion.p>

        {/* Center composition — circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center">
          {/* Purple circle */}
          <motion.div
            className="absolute h-[15.6rem] w-[15.6rem] rounded-full sm:h-[17.7rem] sm:w-[17.7rem] md:h-[23.1rem] md:w-[23.1rem]"
            style={{
              left: 'calc(50% - 200px)',
              top: 'calc(50% - 200px)',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#800080',
            }}
            variants={circleVariants}
            initial="hidden"
            animate="visible"
          />

          {/* Silhouette */}
          <motion.div
            className="relative z-10 h-[28rem] w-[23.2rem] sm:h-[33.6rem] sm:w-[28rem] md:h-[40.8rem] md:w-[33.6rem]"
            style={{ mixBlendMode: 'multiply' }}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <img
              src={silhouette}
              alt="Serene female silhouette with eyes closed"
              className="h-full w-full object-contain object-bottom"
            />
          </motion.div>
        </div>

        {/* Right text — bold heading */}
        <motion.p
          className="hidden md:block absolute right-6 lg:right-12 top-[55%] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          find a<br />Facilitator
        </motion.p>

        {/* Mobile: text below */}
        <div className="md:hidden absolute bottom-8 left-0 right-0 px-6 text-center z-10">
          <motion.p
            className="text-3xl font-bold text-foreground mb-2 tracking-tight"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            find a Facilitator
          </motion.p>
          <motion.p
            className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
            variants={descVariants}
            initial="hidden"
            animate="visible"
          >
            Connecting you with trained, capacity-based practitioners in jurisdictions where 5-MeO-DMT is permitted.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
