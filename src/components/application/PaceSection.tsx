import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import silhouette1 from '@/assets/pace-silhouette.png';
import silhouette2 from '@/assets/pace-silhouette-2.png';
import silhouette3 from '@/assets/pace-silhouette-3.png';

const SLIDES = [
  {
    image: silhouette1,
    alt: 'Calm silhouette profile with eyes closed',
    circleColor: '#FFA500',
    heading: 'less is\nmore',
  },
  {
    image: silhouette2,
    alt: 'Meditative silhouette in seated posture',
    circleColor: '#FF4500',
    heading: 'depth over\nspeed',
  },
  {
    image: silhouette3,
    alt: 'Contemplative silhouette profile',
    circleColor: '#800080',
    heading: 'slow is\nsacred',
  },
];

const INTERVAL_MS = 9000;

export default function PaceSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance]);

  const slide = SLIDES[activeIndex];

  return (
    <section className="relative bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-0 pb-0 min-h-[70vh]">

        {/* Left text — small body copy */}
        <motion.p
          className="hidden md:block absolute left-6 lg:left-12 top-[calc(45%+200px)] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          The speed of your unique system to metabolize shifts and repair wholeness
        </motion.p>

        {/* Center composition — circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center">
          {/* Color circle — crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`circle-${activeIndex}`}
              className="absolute h-[15.6rem] w-[15.6rem] rounded-full sm:h-[17.7rem] sm:w-[17.7rem] md:h-[23.1rem] md:w-[23.1rem]"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: slide.circleColor,
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </AnimatePresence>

          {/* Silhouette — crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`silhouette-${activeIndex}`}
              className="relative z-10 h-[28rem] w-[23.2rem] sm:h-[33.6rem] sm:w-[28rem] md:h-[40.8rem] md:w-[33.6rem]"
              style={{ mixBlendMode: 'multiply' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-contain object-bottom translate-y-8"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right text — bold heading, crossfade per slide */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`heading-${activeIndex}`}
            className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[calc(45%+200px)] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10 whitespace-pre-line"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            {slide.heading}
          </motion.p>
        </AnimatePresence>

        {/* Mobile: text below — crossfade heading */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 px-6 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={`mobile-heading-${activeIndex}`}
              className="text-3xl font-bold text-foreground mb-2 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {slide.heading.replace('\n', ' ')}
            </motion.p>
          </AnimatePresence>
          <motion.p
            className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            The speed of your unique system to metabolize shifts and repair wholeness
          </motion.p>
        </div>
      </div>
    </section>
  );
}
