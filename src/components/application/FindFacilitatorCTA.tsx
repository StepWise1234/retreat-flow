import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import facilitatorImage from '@/assets/facilitator-silhouette.png';

export default function FindFacilitatorCTA() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Left — Text CTA */}
          <motion.div
            className="flex-1 flex flex-col items-start gap-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
              Find a
              <br />
              Facilitator
            </h2>

            <motion.a
              href="#"
              className="group inline-flex items-center gap-3 text-lg sm:text-xl font-medium text-foreground/70 hover:text-foreground transition-colors duration-300"
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span>Explore the directory</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </motion.div>

          {/* Right — Silhouette */}
          <motion.div
            className="flex-1 flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={facilitatorImage}
              alt="Silhouette of a person with eyes closed in a relaxed state"
              className="h-[340px] sm:h-[400px] md:h-[460px] lg:h-[520px] w-auto object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
