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

export default function FormHeader({ sections, currentStep = 0, onStepChange }: FormHeaderProps) {
  const prevSection = sections && currentStep > 0 ? sections[currentStep - 1] : null;
  const nextSection = sections && currentStep < (sections?.length ?? 0) - 1 ? sections[currentStep + 1] : null;
  const currentSection = sections?.[currentStep];

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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF4500] to-transparent blur-sm opacity-30" />
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
                    ? 'text-foreground/40 hover:text-[#FF4500] cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
              >
                ← {prevSection?.label || 'Prev'}
              </button>

              <span className="text-sm font-medium tracking-widest uppercase text-[#FF4500]">
                {currentStep + 1} / {sections.length}
              </span>

              <button
                onClick={() => nextSection && onStepChange?.(currentStep + 1)}
                className={cn(
                  'text-lg tracking-wide transition-colors duration-200',
                  nextSection
                    ? 'text-foreground/40 hover:text-[#FF4500] cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
              >
                {nextSection?.label || 'Next'} →
              </button>
            </div>

            {/* Segmented bar */}
            <div className="flex gap-1.5">
              {sections.map((section, idx) => {
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
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
                        isComplete && 'bg-[#FF4500]',
                        isCurrent && 'bg-[#FF4500] shadow-[0_0_14px_rgba(255,69,0,0.4)]',
                        !isComplete && !isCurrent && 'bg-foreground/10 group-hover:bg-foreground/20',
                      )}
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
