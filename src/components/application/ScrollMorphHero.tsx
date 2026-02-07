import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

/* ─── Types ─── */
type AnimationPhase = 'scatter' | 'line' | 'circle';

interface TestimonialCardTarget {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

/* ─── Testimonials with background images ─── */
const TESTIMONIALS = [
  { quote: 'Transformed my entire clinical approach.', author: 'Dr. Sarah K.', role: 'Psychiatrist', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80' },
  { quote: 'The depth of training is unmatched.', author: 'James R.', role: 'Therapist', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80' },
  { quote: 'I found my community here.', author: 'Maria L.', role: 'Social Worker', img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80' },
  { quote: 'Rigorous, safe, and deeply impactful.', author: 'Dr. Chen W.', role: 'Physician', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80' },
  { quote: 'Every clinician should experience this.', author: 'Ava M.', role: 'Counselor', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80' },
  { quote: 'Changed the trajectory of my practice.', author: 'Noah P.', role: 'Psychologist', img: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80' },
  { quote: 'Held and supported through every step.', author: 'Elena V.', role: 'Nurse Practitioner', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80' },
  { quote: 'A masterclass in facilitation.', author: 'Dr. Obi A.', role: 'Researcher', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80' },
  { quote: 'The screening process shows they care.', author: 'Sophie T.', role: 'Therapist', img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80' },
  { quote: 'Profoundly rewired how I hold space.', author: 'Raj S.', role: 'Facilitator', img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80' },
  { quote: 'World-class training, intimate setting.', author: 'Dr. Kim J.', role: 'Psychiatrist', img: 'https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80' },
  { quote: 'The community stays with you forever.', author: 'Lena C.', role: 'Coach', img: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80' },
  { quote: 'Science-backed and heart-led.', author: 'Marcus D.', role: 'Physician', img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80' },
  { quote: 'Exactly the training I was searching for.', author: 'Priya N.', role: 'Therapist', img: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80' },
  { quote: 'Safe container, exceptional mentors.', author: 'Dr. Alex F.', role: 'Clinician', img: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80' },
];

const TOTAL_CARDS = TESTIMONIALS.length;
const CARD_W = 110;
const CARD_H = 80;

/* ─── Lerp helper ─── */
const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

/* ─── Testimonial Card ─── */
function TestimonialCard({
  testimonial,
  index,
  target,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
  index: number;
  target: TestimonialCardTarget;
}) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: 'spring', stiffness: 40, damping: 15 }}
      style={{
        position: 'absolute',
        width: CARD_W,
        height: CARD_H,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front — image background with dark overlay */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={testimonial.img}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          {/* Dark overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/20" />
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-2.5">
            <p className="text-[8px] leading-tight text-white font-medium line-clamp-3 drop-shadow-sm">
              "{testimonial.quote}"
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-4 w-4 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-[6px] font-bold text-white shrink-0">
                {testimonial.author.charAt(0)}
              </div>
              <span className="text-[6px] text-white/80 truncate drop-shadow-sm">{testimonial.author}</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-card border border-border flex flex-col items-center justify-center p-3"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-[7px] font-bold text-primary uppercase tracking-widest mb-0.5">
            {testimonial.role}
          </p>
          <p className="text-[9px] font-medium text-foreground text-center leading-tight">
            {testimonial.author}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export default function ScrollMorphHero() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>('scatter');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const stickyRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);

  /* Container size */
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, []);

  /* Scroll-driven progress via page scroll */
  const scrollProgress = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const runway = runwayRef.current;
      if (!runway) return;
      const rect = runway.getBoundingClientRect();
      const runwayH = runway.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / Math.max(runwayH, 1)));
      scrollProgress.set(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollProgress]);

  /* Morph: 0→0.25 = circle to arc */
  const morphProgress = useTransform(scrollProgress, [0, 0.25], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  /* Rotation / shuffle: 0.25→1 */
  const scrollRotate = useTransform(scrollProgress, [0.25, 1], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  /* Mouse parallax */
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 80);
    };
    el.addEventListener('mousemove', handleMouse);
    return () => el.removeEventListener('mousemove', handleMouse);
  }, [mouseX]);

  /* Intro sequence */
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase('line'), 400);
    const t2 = setTimeout(() => setIntroPhase('circle'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* Scatter positions */
  const scatterPositions = useMemo(() => {
    return TESTIMONIALS.map(() => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 800,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  /* Render-loop values */
  const [morphVal, setMorphVal] = useState(0);
  const [rotateVal, setRotateVal] = useState(0);
  const [parallaxVal, setParallaxVal] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on('change', setMorphVal);
    const u2 = smoothScrollRotate.on('change', setRotateVal);
    const u3 = smoothMouseX.on('change', setParallaxVal);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  /* Content fade-in */
  const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

  return (
    <div ref={runwayRef} style={{ height: '280vh' }} className="relative">
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: 'hsl(var(--background))' }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center" style={{ perspective: '1000px' }}>
          {/* Intro text — fades out as morph begins */}
          <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={
                introPhase === 'circle' && morphVal < 0.5
                  ? { opacity: 1 - morphVal * 2, y: 0, filter: 'blur(0px)' }
                  : introPhase !== 'circle'
                    ? { opacity: 0, filter: 'blur(10px)' }
                    : { opacity: 0, filter: 'blur(10px)' }
              }
              transition={{ duration: 1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground"
            >
              StepWise
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                introPhase === 'circle' && morphVal < 0.5
                  ? { opacity: 0.6 - morphVal * 1.2 }
                  : { opacity: 0 }
              }
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-6 text-[11px] font-bold tracking-[0.25em] uppercase text-muted-foreground"
            >
              Scroll to explore
            </motion.p>
          </div>

          {/* Content revealed after arc forms */}
          <motion.div
            style={{ opacity: contentOpacity, y: contentY }}
            className="absolute top-[8%] z-20 flex flex-col items-center justify-center text-center pointer-events-none px-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-semibold text-foreground tracking-tight mb-3">
              Explore Our Vision
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
              Where deep growth meets surgical precision,
              <br className="hidden md:block" />
              at the pace of your unique system.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="relative flex items-center justify-center w-full h-full">
            {TESTIMONIALS.map((t, i) => {
              let target: TestimonialCardTarget = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === 'scatter') {
                target = scatterPositions[i];
              } else if (introPhase === 'line') {
                const spacing = CARD_W + 10;
                const totalW = TOTAL_CARDS * spacing;
                target = {
                  x: i * spacing - totalW / 2,
                  y: 0,
                  rotation: 0,
                  scale: 1,
                  opacity: 1,
                };
              } else {
                /* Circle → Arc morph */
                const isMobile = containerSize.width < 768;
                const minDim = Math.min(containerSize.width, containerSize.height);

                // Circle
                const circleRadius = Math.min(minDim * 0.32, 300);
                const circleAngle = (i / TOTAL_CARDS) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };

                // Bottom arc
                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * (isMobile ? 1.0 : 0.8);
                const arcApexY = containerSize.height * (isMobile ? 0.15 : 0.05);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 150 : 200;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_CARDS - 1);

                const scrollProg = Math.min(Math.max(rotateVal / 360, 0), 1);
                const maxRot = spreadAngle * 0.8;
                const boundedRot = -scrollProg * maxRot;

                const arcAngle = startAngle + i * step + boundedRot;
                const arcRad = (arcAngle * Math.PI) / 180;
                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxVal,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: arcAngle + 90,
                  scale: isMobile ? 1.3 : 1.6,
                };

                target = {
                  x: lerp(circlePos.x, arcPos.x, morphVal),
                  y: lerp(circlePos.y, arcPos.y, morphVal),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphVal),
                  scale: lerp(1, arcPos.scale, morphVal),
                  opacity: 1,
                };
              }

              return (
                <TestimonialCard
                  key={i}
                  testimonial={t}
                  index={i}
                  target={target}
                />
              );
            })}
          </div>
        </div>

        {/* Scroll indicator at bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-muted-foreground/50"
          >
            <div className="h-8 w-5 rounded-full border-2 border-current flex items-start justify-center p-1">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
