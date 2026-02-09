import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import facilitatorImage from '@/assets/facilitator-silhouette.png';

export default function FindFacilitatorCTA() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left — Text CTA */}
          <motion.a
            href="#"
            className="flex-1 flex items-center gap-4 group cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ x: 6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05] whitespace-nowrap">
              Find a Facilitator
            </h2>
            <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-foreground/60 group-hover:text-foreground transition-all duration-300 group-hover:translate-x-2 shrink-0" />
          </motion.a>

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
              alt="Silhouette of a Latin-American male with eyes closed in a relaxed state"
              className="h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] w-auto object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
