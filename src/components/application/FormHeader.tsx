import { motion } from 'framer-motion';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

interface Section {
  label: string;
  index: number;
}

interface FormHeaderProps {
  sections?: Section[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

function getStepColor(idx: number, total: number) {
  const t = total <= 1 ? 0 : idx / (total - 1);
  if (t < 1 / 3) return '#FF4500';   // Red-Orange
  if (t < 2 / 3) return '#FFA500';   // Orange
  return '#800080';                    // Purple
}

function getStepGlow(color: string) {
  return `0 0 14px ${color}66`;
}

export default function FormHeader({ sections, currentStep = 0, onStepChange }: FormHeaderProps) {
  const prevSection = sections && currentStep > 0 ? sections[currentStep - 1] : null;
  const nextSection = sections && currentStep < (sections?.length ?? 0) - 1 ? sections[currentStep + 1] : null;
  const currentSection = sections?.[currentStep];
  const total = sections?.length ?? 1;
  const activeColor = getStepColor(currentStep, total);

  return (
    <section className="relative overflow-hidden bg-[#fafafa]">
      {/* Animated grid background */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.08}
          duration={4}
          className="w-full h-full fill-black/5 stroke-black/5"
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 pt-20 md:pt-28 pb-10 flex flex-col items-center justify-center">
        {/* Title */}
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Application
        </motion.h2>

        {/* Brand-colored line beneath text */}
        <div className="relative mt-4 w-full max-w-lg h-px z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-60" style={{ backgroundImage: `linear-gradient(to right, transparent, ${activeColor}, transparent)` }} />
          <div className="absolute inset-0 blur-sm opacity-30" style={{ backgroundImage: `linear-gradient(to right, transparent, ${activeColor}, transparent)` }} />
        </div>

        {/* Spacer */}
        <div className="h-12" />

        {/* Segmented step navigation */}
        {sections && (
          <div className="w-full max-w-xl z-10">
            {/* Current page title */}
            <motion.p
              key={currentStep}
              className="text-center text-2xl sm:text-3xl font-semibold tracking-wide text-foreground mb-5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentSection?.label}
            </motion.p>

            {/* Prev / Current Step / Next row */}
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                onClick={() => prevSection && onStepChange?.(currentStep - 1)}
                className={cn(
                  'text-lg tracking-wide transition-colors duration-200',
                  prevSection
                    ? 'text-foreground/40 cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
                style={prevSection ? { ['--hover-color' as string]: activeColor } : undefined}
                onMouseEnter={(e) => prevSection && (e.currentTarget.style.color = activeColor)}
                onMouseLeave={(e) => prevSection && (e.currentTarget.style.color = '')}
              >
                ← {prevSection?.label || 'Prev'}
              </button>

              <span className="text-sm font-medium tracking-widest uppercase" style={{ color: activeColor }}>
                {currentStep + 1} / {sections.length}
              </span>

              <button
                onClick={() => nextSection && onStepChange?.(currentStep + 1)}
                className={cn(
                  'text-lg tracking-wide transition-colors duration-200',
                  nextSection
                    ? 'text-foreground/40 cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
                onMouseEnter={(e) => nextSection && (e.currentTarget.style.color = activeColor)}
                onMouseLeave={(e) => nextSection && (e.currentTarget.style.color = '')}
              >
                {nextSection?.label || 'Next'} →
              </button>
            </div>

            {/* Segmented bar */}
            <div className="flex gap-1.5">
              {sections.map((section, idx) => {
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
                const segColor = getStepColor(idx, total);
                return (
                  <button
                    key={idx}
                    onClick={() => onStepChange?.(idx)}
                    className="group flex-1 py-2 cursor-pointer"
                    aria-label={`Go to ${section.label}`}
                  >
                    <div
                      className={cn(
                        'h-2 rounded-full transition-all duration-500 ease-out',
                        !isComplete && !isCurrent && 'bg-foreground/10 group-hover:bg-foreground/20',
                      )}
                      style={
                        isComplete || isCurrent
                          ? {
                              backgroundColor: segColor,
                              boxShadow: isCurrent ? getStepGlow(segColor) : undefined,
                            }
                          : undefined
                      }
                    />
                    {/* Tooltip label on hover */}
                    <span className="block mt-1.5 text-[11px] text-center tracking-wide text-transparent group-hover:text-foreground/40 transition-colors duration-200 whitespace-nowrap">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
