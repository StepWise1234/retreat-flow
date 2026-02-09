import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "This training changed the entire trajectory of my practice. The depth of knowledge and care from the facilitators is unmatched.",
    name: 'Maria Santos',
    role: 'Therapist',
    image: 'https://images.unsplash.com/photo-1701615004837-40d8573b6652?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "I felt held and supported through every step. The screening process itself showed me how much they care about safety.",
    name: 'James Okafor',
    role: 'Clinical Psychologist',
    image: 'https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "The community you build here stays with you long after the retreat ends. I found my people.",
    name: 'Elena Voss',
    role: 'Integration Coach',
    image: 'https://plus.unsplash.com/premium_photo-1689977830819-d00b3a9b7363?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "StepWise gave me the structured framework I was missing. My clients notice the difference immediately.",
    name: 'David Chen',
    role: 'Somatic Practitioner',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "The nervous system focus is what sets this apart. I've never experienced training this precise.",
    name: 'Amara Obi',
    role: 'Breathwork Facilitator',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "After years of searching, this is the program that actually delivered on its promise of depth and safety.",
    name: 'Lucas Rivera',
    role: 'Retreat Leader',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "The capacity-based approach changed how I think about healing — not just for clients, but for myself.",
    name: 'Priya Sharma',
    role: 'Trauma Therapist',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "I came for the certification. I stayed for the transformation. This work is unlike anything else available.",
    name: 'Thomas Bergström',
    role: 'Psychotherapist',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "Every module built on the last. By the end, I had an entirely new lens for understanding integration.",
    name: 'Keiko Tanaka',
    role: 'Wellness Director',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "The facilitators model what they teach. You can feel the integrity in every interaction.",
    name: 'Andre Williams',
    role: 'Counselor',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "I've recommended this to every colleague who asks about serious facilitator training. There's nothing comparable.",
    name: 'Sofia Petrov',
    role: 'Clinical Researcher',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
  {
    quote: "The small cohort size meant I was truly seen. That level of attention is rare and invaluable.",
    name: 'Rafael Mora',
    role: 'Integration Specialist',
    image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&auto=format&fit=crop&q=80',
  },
];

// Triple the array for seamless infinite looping
const loopedTestimonials = [...testimonials, ...testimonials, ...testimonials];

const SCROLL_SPEED = 120; // px per second

export default function TestimonialsCarousel() {
  const [active, setActive] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useRef<'left' | 'right' | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(advance, 5000);
    return () => clearInterval(interval);
  }, [advance]);

  // Center the strip on the middle (duplicate) set on mount
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    // Each avatar: size + gap. We offset by one full set width.
    requestAnimationFrame(() => {
      const singleSetWidth = strip.scrollWidth / 3;
      strip.scrollLeft = singleSetWidth;
    });
  }, []);

  // Infinite scroll loop reset
  const clampScroll = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const singleSetWidth = strip.scrollWidth / 3;
    if (strip.scrollLeft >= singleSetWidth * 2) {
      strip.scrollLeft -= singleSetWidth;
    } else if (strip.scrollLeft <= 0) {
      strip.scrollLeft += singleSetWidth;
    }
  }, []);

  // Animate scroll on hover
  const tick = useCallback(
    (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const strip = stripRef.current;
      if (strip && scrollDirection.current) {
        const dir = scrollDirection.current === 'right' ? 1 : -1;
        strip.scrollLeft += dir * SCROLL_SPEED * delta;
        clampScroll();
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [clampScroll],
  );

  const startScroll = useCallback(
    (dir: 'left' | 'right') => {
      scrollDirection.current = dir;
      lastTimeRef.current = 0;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [tick],
  );

  const stopScroll = useCallback(() => {
    scrollDirection.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        {/* Quote */}
        <div className="relative min-h-[100px] mb-12">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              className="absolute inset-0 text-xl md:text-2xl font-light leading-relaxed text-foreground"
              initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              "{testimonials[active].quote}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Author row */}
        <div className="flex items-center gap-6">
          {/* Scrollable avatar strip with hover zones */}
          <div className="relative flex-1 min-w-0">
            {/* Left hover zone */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 z-20 cursor-w-resize"
              onMouseEnter={() => startScroll('left')}
              onMouseLeave={stopScroll}
              style={{
                background: 'linear-gradient(to right, hsl(var(--background)), transparent)',
              }}
            />
            {/* Right hover zone */}
            <div
              className="absolute right-0 top-0 bottom-0 w-12 z-20 cursor-e-resize"
              onMouseEnter={() => startScroll('right')}
              onMouseLeave={stopScroll}
              style={{
                background: 'linear-gradient(to left, hsl(var(--background)), transparent)',
              }}
            />

            {/* Strip */}
            <div
              ref={stripRef}
              className="flex gap-3 overflow-x-hidden py-2 scrollbar-hide"
            >
              {loopedTestimonials.map((t, i) => {
                const realIndex = i % testimonials.length;
                return (
                  <button
                    key={i}
                    onClick={() => setActive(realIndex)}
                    className={`
                      relative shrink-0 h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 rounded-full overflow-hidden ring-2 ring-background
                      transition-all duration-300 ease-out cursor-pointer
                      ${active === realIndex ? 'z-10 scale-110 ring-primary/50' : 'grayscale hover:grayscale-0 hover:scale-105'}
                    `}
                  >
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-14 sm:h-16 md:h-20 w-px bg-border shrink-0" />

          {/* Active author info */}
          <div className="relative shrink-0 min-w-[120px] min-h-[44px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                className="flex flex-col justify-center"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-sm font-medium text-foreground">{testimonials[active].name}</span>
                <span className="text-xs text-muted-foreground">{testimonials[active].role}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
