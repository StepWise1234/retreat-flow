import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import silhouette1 from '@/assets/pace-silhouette.png';
import silhouette2 from '@/assets/pace-silhouette-2.png';
import silhouette3 from '@/assets/pace-silhouette-3.png';

interface Slide {
  image: string;
  alt: string;
  circleColor: string;
  heading: string;
  description: string;
  imageScale?: number;
  mirrorX?: boolean;
}

const slides: Slide[] = [
  {
    image: silhouette1,
    alt: 'Calm silhouette profile with eyes closed',
    circleColor: '#FFA500',
    heading: 'less is\nmore',
    description:
      'The speed of your unique system to metabolize shifts and repair wholeness',
  },
  {
    image: silhouette2,
    alt: 'Serene silhouette exhaling in deep relaxation',
    circleColor: '#FF4500',
    heading: 'depth over\nspeed',
    description:
      'Where rushing ends and real transformation begins — one breath at a time',
    imageScale: 0.85,
    mirrorX: true,
  },
  {
    image: silhouette3,
    alt: 'Peaceful silhouette releasing tension upward',
    circleColor: '#800080',
    heading: 'slow is\nsacred',
    description:
      'The nervous system doesn\'t heal on a deadline — it heals in its own time',
    imageScale: 0.95,
  },
];

const INTERVAL_MS = 9000;

const imageVariants = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.8, ease: 'easeInOut' as const } },
};

const circleVariants = {
  enter: { opacity: 0, scale: 0.7 },
  center: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 } },
  exit: { opacity: 0, scale: 1.15, transition: { duration: 0.7, ease: 'easeInOut' as const } },
};

const textVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.5 } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.5, ease: 'easeIn' as const } },
};

const descVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' as const, delay: 0.7 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.4, ease: 'easeIn' as const } },
};

export default function PaceSection() {
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance]);

  const slide = slides[current];

  return (
    <section className="relative bg-background">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-0 pb-0 min-h-[70vh]">

        {/* Left text — description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${current}`}
            className="hidden md:block absolute left-6 lg:left-12 top-[calc(45%+200px)] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
            variants={descVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {slide.description}
          </motion.p>
        </AnimatePresence>

        {/* Center composition — circle behind, silhouette overlapping */}
        <div className="relative flex items-center justify-center">
          {/* Colored circle */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`circle-${current}`}
              className="absolute h-[15.6rem] w-[15.6rem] rounded-full sm:h-[17.7rem] sm:w-[17.7rem] md:h-[23.1rem] md:w-[23.1rem]"
              style={{
                left: 'calc(50% - 200px)',
                top: 'calc(50% - 200px)',
                transform: 'translate(-50%, -50%)',
                backgroundColor: slide.circleColor,
              }}
              variants={circleVariants}
              initial="enter"
              animate="center"
              exit="exit"
            />
          </AnimatePresence>

          {/* Silhouette */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${current}`}
              className="relative z-10 h-[28rem] w-[23.2rem] sm:h-[33.6rem] sm:w-[28rem] md:h-[40.8rem] md:w-[33.6rem]"
              style={{ mixBlendMode: 'multiply' }}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-contain object-bottom"
                style={{
                  ...(slide.imageScale ? { transform: `scale(${slide.imageScale})${slide.mirrorX ? ' scaleX(-1)' : ''}`, transformOrigin: 'bottom center' } : slide.mirrorX ? { transform: 'scaleX(-1)' } : undefined),
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right text — bold heading */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`heading-${current}`}
            className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[calc(45%+200px)] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10"
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {slide.heading.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </motion.p>
        </AnimatePresence>

        {/* Mobile: text below */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 px-6 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={`mob-heading-${current}`}
              className="text-3xl font-bold text-foreground mb-2 tracking-tight"
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {slide.heading.replace('\n', ' ')}
            </motion.p>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={`mob-desc-${current}`}
              className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
              variants={descVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {slide.description}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-[-1rem] left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group relative h-2 rounded-full transition-all duration-500"
              style={{ width: i === current ? '2rem' : '0.5rem' }}
            >
              <span
                className="absolute inset-0 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i === current ? s.circleColor : undefined,
                  opacity: i === current ? 1 : 0.3,
                }}
              />
              {i !== current && (
                <span className="absolute inset-0 rounded-full bg-muted-foreground/30" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
