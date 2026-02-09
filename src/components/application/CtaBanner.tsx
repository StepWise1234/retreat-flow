import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ctaSilhouette from '@/assets/cta-silhouette.png';

export default function CtaBanner() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-12 md:gap-0">
          {/* Left — Text & CTA */}
          <motion.div
            className="flex-1 flex flex-col items-center md:items-start gap-8 z-10"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* StepWise wordmark */}
            <div className="flex items-center gap-3">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                StepWise
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="block h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full" style={{ backgroundColor: '#FFA500' }} />
                <span className="block h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full" style={{ backgroundColor: '#FF4500' }} />
                <span className="block h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full" style={{ backgroundColor: '#800080' }} />
              </div>
            </div>

            {/* CTA link */}
            <a
              href="#find-facilitator"
              className="group flex items-center gap-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground/80 hover:text-foreground transition-colors duration-300"
            >
              <span>Find a Facilitator</span>
              <ArrowRight className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 transition-transform duration-300 group-hover:translate-x-2" />
            </a>
          </motion.div>

          {/* Right — Silhouette */}
          <motion.div
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={ctaSilhouette}
              alt="Confident facilitator silhouette"
              className="h-[24rem] sm:h-[28rem] md:h-[32rem] lg:h-[36rem] w-auto object-contain object-bottom"
              style={{ mixBlendMode: 'multiply' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
