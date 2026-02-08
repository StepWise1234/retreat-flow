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
              className="text-center text-lg sm:text-xl font-semibold tracking-wide text-white mb-4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentSection?.label}
            </motion.p>

            {/* Segmented bar */}
            <div className="flex gap-1.5">
              {sections.map((section, idx) => {
                const isComplete = idx < currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <button
                    key={idx}
                    onClick={() => onStepChange?.(idx)}
                    className={cn(
                      'flex-1 h-1.5 rounded-full transition-all duration-500 ease-out',
                      isComplete && 'bg-[hsl(160_30%_72%)]',
                      isCurrent && 'bg-[hsl(160_30%_72%)] shadow-[0_0_8px_hsl(160_30%_72%/0.5)]',
                      !isComplete && !isCurrent && 'bg-white/15',
                    )}
                    aria-label={`Go to ${section.label}`}
                  />
                );
              })}
            </div>

            {/* Prev / Next labels */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-xs tracking-wide text-white/40 font-light">
                {prevSection ? `← ${prevSection.label}` : ''}
              </span>
              <span className="text-xs tracking-wide text-white/40 font-light">
                {nextSection ? `${nextSection.label} →` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
