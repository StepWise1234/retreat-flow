import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklesCore } from '@/components/ui/sparkles';

interface StepSection {
  label: string;
  index: number;
}

interface StepColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

interface FormHeaderProps {
  sections: StepSection[];
  progressColors: StepColor[];
  step: number;
  onStepChange: (step: number) => void;
}

export default function FormHeader({ sections, progressColors, step, onStepChange }: FormHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative mx-auto max-w-4xl px-6 py-12 md:py-16 flex flex-col items-center justify-center">
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

        {/* Step progress buttons — above sparkles */}
        <div className="relative z-10 mt-6 flex items-center justify-center gap-1 overflow-x-auto pb-1">
          {sections.map((section, idx) => {
            const color = progressColors[idx];
            const isComplete = idx < step;
            const isCurrent = idx === step;
            return (
              <button
                key={idx}
                onClick={() => onStepChange(idx)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border whitespace-nowrap shrink-0',
                  isCurrent && `${color.bg} ${color.text} ${color.border}`,
                  isComplete && `${color.dot} text-white border-transparent`,
                  !isCurrent && !isComplete && 'bg-white/10 text-white/60 border-transparent'
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : <span>{idx + 1}</span>}
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sparkles below the progress */}
        <div className="relative w-full h-20 mt-0 z-0">
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
      </div>
    </section>
  );
}
