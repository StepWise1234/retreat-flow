import { motion } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';

export default function FormHeader() {
  return (
    <section className="relative overflow-hidden bg-black">
      <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-28 flex flex-col items-center justify-center">
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
          {/* Gradient line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent blur-sm" />
        </div>

        {/* Sparkles below the line */}
        <div className="relative w-full h-40 mt-0 z-0">
          {/* Radial fade mask */}
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
