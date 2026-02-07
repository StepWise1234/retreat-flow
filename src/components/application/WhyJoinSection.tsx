import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const STATS = [
  { value: 'Learn', label: 'Online Flight School' },
  { value: '4-Day', label: 'Immersive Retreats' },
  { value: 'Improve', label: 'Advanced Retreats' },
  { value: 'Mastery', label: 'Industry-Leading Teachers' },
];

const TESTIMONIALS = [
  {
    quote: "This training changed the entire trajectory of my practice. The depth of knowledge and care from the facilitators is unmatched.",
    author: 'Recent Graduate',
    cohort: 'Fall 2025 Cohort',
  },
  {
    quote: "I felt held and supported through every step. The screening process itself showed me how much they care about safety.",
    author: 'Training Participant',
    cohort: 'Spring 2025 Cohort',
  },
  {
    quote: "The community you build here stays with you long after the retreat ends. I found my people.",
    author: 'Alumni',
    cohort: 'Winter 2024 Cohort',
  },
];

export default function WhyJoinSection() {
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8 space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card/80 backdrop-blur-sm p-4 text-center hover-lift"
          >
            <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Rotating testimonials — transparent, clean, popping text */}
      <div className="relative min-h-[140px] flex items-center justify-center overflow-hidden">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ease-in-out"
            style={{
              opacity: i === activeQuote ? 1 : 0,
              transform: i === activeQuote ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
              pointerEvents: i === activeQuote ? 'auto' : 'none',
            }}
          >
            <blockquote className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground leading-snug max-w-2xl">
              "{t.quote}"
            </blockquote>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/70">{t.author}</span>
              <span className="text-sm text-muted-foreground">· {t.cohort}</span>
            </div>
          </div>
        ))}

        {/* Dot indicators */}
        <div className="absolute bottom-0 flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveQuote(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === activeQuote ? '24px' : '6px',
                backgroundColor: i === activeQuote
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground) / 0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* CTA nudge */}
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Limited Spots Available</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Each cohort is intentionally small to ensure quality training. Complete your application below — the process takes about 15 minutes.
        </p>
      </div>
    </div>
  );
}
