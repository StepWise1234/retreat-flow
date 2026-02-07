import { useEffect, useRef } from 'react';
import { Plane, Sparkles } from 'lucide-react';
import heroImage from '@/assets/flight-school-hero.png';

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const img = imgRef.current;
    if (!hero || !img) return;

    const handleScroll = () => {
      const rect = hero.getBoundingClientRect();
      const heroH = hero.offsetHeight;
      // progress 0→1 as hero scrolls out of view
      const progress = Math.max(0, Math.min(1, -rect.top / heroH));
      // Theater zoom: scale from 1 → 1.35 as you scroll
      const scale = 1 + progress * 0.35;
      img.style.transform = `scale(${scale})`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={heroRef}
      className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden shadow-2xl"
      style={{ marginBottom: '2.5rem' }}
    >
      {/* Background image with scroll-driven zoom */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imgRef}
          src={heroImage}
          alt="View from airplane window above pink clouds at sunset"
          className="h-full w-full object-cover will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: 'scale(1)' }}
        />
      </div>

      {/* Multi-layer gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(280,60%,30%,0.25)] via-transparent to-[hsl(330,60%,40%,0.2)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200,80%,50%,0.08)] to-transparent" />

      {/* Floating particles overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[15%] left-[20%] h-1 w-1 rounded-full bg-white animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-[25%] h-1.5 w-1.5 rounded-full bg-white/80 animate-[float_8s_ease-in-out_1s_infinite]" />
        <div className="absolute top-[55%] left-[60%] h-1 w-1 rounded-full bg-white/60 animate-[float_7s_ease-in-out_2s_infinite]" />
        <div className="absolute top-[70%] left-[35%] h-0.5 w-0.5 rounded-full bg-white/70 animate-[float_5s_ease-in-out_3s_infinite]" />
        <div className="absolute top-[20%] right-[40%] h-1 w-1 rounded-full bg-white/50 animate-[float_9s_ease-in-out_0.5s_infinite]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 sm:py-32 md:py-40">
        {/* Glowing icon */}
        <div className="mb-5 relative">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-150 animate-pulse" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            <Plane className="h-6 w-6 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          <span className="drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">Flight School</span>
          <br />
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            Application
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-white/80 max-w-lg drop-shadow-md leading-relaxed">
          Begin your journey toward becoming a certified facilitator. We appreciate your interest — please answer the questions as fully as you can.
        </p>

        {/* Scroll hint */}
        <div className="mt-8 flex items-center gap-2 text-white/50 text-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Scroll to learn more & apply</span>
        </div>
      </div>

      {/* Bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}
