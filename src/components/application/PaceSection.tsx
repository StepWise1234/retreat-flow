import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import silhouetteImg from '@/assets/pace-silhouette.png';

interface Slide {
  id: number;
  headline: string;
  description: string;
  circleColor: string;
  image: string;
}

const slides: Slide[] = [
  {
    id: 0,
    headline: 'less is\nmore',
    description:
      'The speed of your unique system to metabolize shifts and repair wholeness',
    circleColor: '#FFA500',
    image: silhouetteImg,
  },
  {
    id: 1,
    headline: 'depth over\nspeed',
    description:
      'Honor the wisdom that emerges when you stop rushing toward resolution',
    circleColor: '#FF4500',
    image: silhouetteImg,
  },
  {
    id: 2,
    headline: 'slow is\nsacred',
    description:
      'Trust the stillness between breaths where transformation takes root',
    circleColor: '#800080',
    image: silhouetteImg,
  },
];

const INTERVAL = 9000;

export default function PaceSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, INTERVAL);
    return () => clearInterval(timer);
  }, [advance]);

  const current = slides[activeIndex];

  return (
    <section className="relative bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-0 pb-0 min-h-[70vh]">

        {/* Left description text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${current.id}`}
            className="hidden md:block absolute left-6 lg:left-12 top-[calc(45%+200px)] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {current.description}
          </motion.p>
        </AnimatePresence>

        {/* Center composition */}
        <div className="relative flex items-center justify-center">
          {/* Colored circle — crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`circle-${current.id}`}
              className="absolute h-[15.6rem] w-[15.6rem] rounded-full sm:h-[17.7rem] sm:w-[17.7rem] md:h-[23.1rem] md:w-[23.1rem]"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: current.circleColor,
              }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </AnimatePresence>

          {/* Silhouette — crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`sil-${current.id}`}
              className="relative z-10 h-[28rem] w-[23.2rem] sm:h-[33.6rem] sm:w-[28rem] md:h-[40.8rem] md:w-[33.6rem]"
              style={{ mixBlendMode: 'multiply' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <img
                src={current.image}
                alt="Calm silhouette profile with eyes closed"
                className="h-full w-full object-contain object-bottom translate-y-8"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right headline text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`headline-${current.id}`}
            className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[calc(45%+200px)] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10 whitespace-pre-line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {current.headline}
          </motion.p>
        </AnimatePresence>

        {/* Mobile: text below */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`mobile-${current.id}`}
            className="md:hidden absolute bottom-4 left-0 right-0 px-6 text-center z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-3xl font-bold text-foreground mb-2 tracking-tight whitespace-pre-line">
              {current.headline}
            </p>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-[-1rem] left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(i)}
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: i === activeIndex ? '1.5rem' : '0.5rem',
                backgroundColor:
                  i === activeIndex ? current.circleColor : 'hsl(var(--muted-foreground) / 0.3)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
