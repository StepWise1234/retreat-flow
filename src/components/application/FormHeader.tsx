import { motion } from 'framer-motion';

export default function FormHeader() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Gradient transition strip — celadon to warm dusk */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, hsl(160 30% 72% / 0.08) 0%, hsl(40 30% 97%) 40%, hsl(30 35% 95%) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        {/* Thin decorative line */}
        <motion.div
          className="mx-auto mb-8 h-px w-16"
          style={{ backgroundColor: 'hsl(160 30% 72%)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />

        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          Training Application
        </motion.h2>

        <motion.p
          className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          We appreciate your interest — please answer the questions as fully as you can.
        </motion.p>

        {/* Bottom decorative line */}
        <motion.div
          className="mx-auto mt-10 h-px w-16"
          style={{ backgroundColor: 'hsl(160 30% 72%)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </section>
  );
}
