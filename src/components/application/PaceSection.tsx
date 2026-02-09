import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import silhouette1 from '@/assets/pace-silhouette.png';
import silhouette2 from '@/assets/pace-silhouette-2.png';
import silhouette3 from '@/assets/pace-silhouette-3.png';

interface HeroSlide {
  image: string;
  circleColor: string;
  headline: string;
  body: string;
  mirrorSilhouette?: boolean;
  silhouetteScale?: number;
}

const SLIDES: HeroSlide[] = [
  {
    image: silhouette1,
    circleColor: '#FFA500',
    headline: 'less is\nmore',
    body: 'The unique speed of your system to metabolize shifts and repair wholeness.',
  },
  {
    image: silhouette2,
    circleColor: '#FF4500',
    headline: 'subtle is\nsignificant',
    body: 'Honor surgically precise breakthroughs and root real, lasting transformation into life.',
    mirrorSilhouette: true,
    silhouetteScale: 0.9,
  },
  {
    image: silhouette3,
    circleColor: '#800080',
    headline: 'slow is\nsacred',
    body: 'Depth cannot be rushed. Trust the rhythm of your nervous system as it rewires toward wholeness.',
  },
];

const INTERVAL_MS = 9000;

export default function PaceSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[activeIndex];

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-0 pb-0 min-h-[80vh] overflow-visible">

        <AnimatePresence initial={false}>
          {SLIDES.map((s, i) =>
            i === activeIndex ? (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center overflow-visible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Left text — body copy */}
                <motion.p
                  className="hidden md:block absolute left-6 lg:left-12 top-[calc(45%+230px)] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {s.body}
                </motion.p>

                {/* Center composition */}
                <div className="relative flex items-center justify-center overflow-visible">
                  {/* Colored circle */}
                  <motion.div
                    className="absolute h-[18.4rem] w-[18.4rem] rounded-full sm:h-[20.8rem] sm:w-[20.8rem] md:h-[27.2rem] md:w-[27.2rem]"
                    style={{
                      left: 'calc(-10% + 95px)',
                      top: '130px',
                      backgroundColor: s.circleColor,
                    }}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {/* Silhouette */}
                  <motion.div
                    className="relative z-10 h-[36.25rem] w-[23.2rem] sm:h-[41.85rem] sm:w-[28rem] md:h-[49rem] md:w-[33.6rem] overflow-visible"
                    style={{ mixBlendMode: 'multiply' }}
                    initial={{ opacity: 0, scale: 1.06, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: -10 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <img
                      src={s.image}
                      alt="Calm silhouette profile"
                      className="h-full w-full object-contain object-bottom"
                      style={{
                        transform: `${s.mirrorSilhouette ? 'scaleX(-1) ' : ''}${s.silhouetteScale ? `scale(${s.silhouetteScale})` : ''}`,
                        transformOrigin: 'bottom center',
                      }}
                    />
                  </motion.div>
                </div>

                {/* Right text — bold headline */}
                <motion.p
                  className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[calc(45%+220px)] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10 whitespace-pre-line text-right"
                  initial={{ opacity: 0, x: 40, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {s.headline}
                </motion.p>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === activeIndex ? '2rem' : '0.375rem',
                backgroundColor: i === activeIndex ? slide.circleColor : 'hsl(var(--muted-foreground) / 0.3)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Mobile: text below */}
        <div className="md:hidden absolute bottom-12 left-0 right-0 px-6 text-center z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`m-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-3xl font-bold text-foreground mb-2 tracking-tight whitespace-pre-line">
                {slide.headline.replace('\n', ' ')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {slide.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
