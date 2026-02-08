import { motion } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';
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
    <section className="relative overflow-hidden bg-black">
      <div className="relative mx-auto max-w-4xl px-6 pt-20 md:pt-28 pb-10 flex flex-col items-center justify-center">
        {/* Title */}
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-center z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Training Application
        </motion.h2>

        {/* Glowing line beneath text */}
        <div className="relative mt-4 w-full max-w-lg h-px z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(160_30%_72%)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(160_30%_72%)] to-transparent blur-sm" />
        </div>

        {/* Sparkles below the line */}
        <div className="relative w-full h-32 mt-0 z-0">
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.5}
              particleDensity={80}
              className="w-full h-full"
              particleColor="#ffffff"
              speed={2}
            />
          </div>
        </div>

        {/* Segmented step navigation */}
        {sections && (
          <div className="w-full max-w-xl z-10 mt-2">
            {/* Current page title */}
            <motion.p
              key={currentStep}
              className="text-center text-xl sm:text-2xl font-semibold tracking-wide text-white mb-5"
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
                  'text-sm tracking-wide transition-colors duration-200',
                  prevSection
                    ? 'text-white/50 hover:text-[hsl(155_35%_65%)] cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
              >
                ← {prevSection?.label || 'Prev'}
              </button>

              <span className="text-xs font-medium tracking-widest uppercase text-[hsl(155_35%_65%)]">
                {currentStep + 1} / {sections.length}
              </span>

              <button
                onClick={() => nextSection && onStepChange?.(currentStep + 1)}
                className={cn(
                  'text-sm tracking-wide transition-colors duration-200',
                  nextSection
                    ? 'text-white/50 hover:text-[hsl(155_35%_65%)] cursor-pointer'
                    : 'text-transparent pointer-events-none',
                )}
              >
                {nextSection?.label || 'Next'} →
              </button>
            </div>

            {/* Segmented bar — taller for easier clicking */}
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
                        isComplete && 'bg-[hsl(155_35%_65%)]',
                        isCurrent && 'bg-[hsl(155_40%_60%)] shadow-[0_0_12px_hsl(155_35%_65%/0.6)]',
                        !isComplete && !isCurrent && 'bg-white/12 group-hover:bg-white/25',
                      )}
                    />
                    {/* Tooltip label on hover */}
                    <span className="block mt-1.5 text-[10px] text-center tracking-wide text-white/0 group-hover:text-white/50 transition-colors duration-200 whitespace-nowrap">
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
