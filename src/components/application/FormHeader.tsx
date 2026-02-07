import { motion, AnimatePresence } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';
import MorphingPageDots from '@/components/ui/morphing-page-dots';

interface StepSection {
  label: string;
  index: number;
}

interface FormHeaderProps {
  sections: StepSection[];
  step: number;
  onStepChange: (step: number) => void;
}

export default function FormHeader({ sections, step, onStepChange }: FormHeaderProps) {
  const prevLabel = step > 0 ? sections[step - 1].label : null;
  const nextLabel = step < sections.length - 1 ? sections[step + 1].label : null;
  const currentLabel = sections[step].label;

  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative mx-auto max-w-4xl px-6 py-10 md:py-14 flex flex-col items-center justify-center">
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

        {/* Sage-green glowing line beneath text */}
        <div className="relative mt-4 w-full max-w-lg h-px z-10">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, transparent, hsl(160 30% 72%), transparent)',
            }}
          />
          <div
            className="absolute inset-0 blur-sm"
            style={{
              background: 'linear-gradient(to right, transparent, hsl(160 30% 72%), transparent)',
            }}
          />
        </div>

        {/* Sparkles */}
        <div className="relative w-full h-16 mt-0 z-0">
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

        {/* Step navigation: prev title · current title · next title */}
        <div className="relative z-10 -mt-2 mb-1 w-full max-w-md">
          {/* Prev / Current / Next labels */}
          <div className="flex items-center justify-between mb-3">
            {/* Previous label */}
            <div className="flex-1 text-left min-w-0">
              <AnimatePresence mode="wait">
                {prevLabel && (
                  <motion.button
                    key={prevLabel}
                    onClick={() => onStepChange(step - 1)}
                    className="text-[11px] sm:text-xs font-medium tracking-wide uppercase text-white/35 hover:text-white/55 transition-colors truncate"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {prevLabel}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Current label */}
            <div className="flex-shrink-0 px-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentLabel}
                  className="text-sm sm:text-base font-semibold tracking-wide uppercase text-white"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentLabel}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Next label */}
            <div className="flex-1 text-right min-w-0">
              <AnimatePresence mode="wait">
                {nextLabel && (
                  <motion.button
                    key={nextLabel}
                    onClick={() => onStepChange(step + 1)}
                    className="text-[11px] sm:text-xs font-medium tracking-wide uppercase text-white/35 hover:text-white/55 transition-colors truncate"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {nextLabel}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Morphing dots */}
          <MorphingPageDots
            total={sections.length}
            page={step}
            onPageChange={onStepChange}
          />
        </div>
      </div>
    </section>
  );
}
