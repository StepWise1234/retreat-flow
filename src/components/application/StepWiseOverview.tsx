import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Begin Low',
    description:
      'The client begins with the smallest draw on the lowest concentration, often experienced as subtle and relaxing.',
  },
  {
    number: '02',
    title: 'Settle & Stack',
    description:
      'The facilitator watches for a settling of the nervous system, only then do they invite the client to take another draw. This gently allows the system to acclimate at the client\'s unique pace.',
  },
  {
    number: '03',
    title: 'Step Up',
    description:
      'When the client is ready, the next higher concentration expands somatic sensation and invites a willingness of surrender — always at the client\'s pace.',
  },
  {
    number: '04',
    title: 'Client Directs',
    description:
      'About 30–40 minutes in, clients may choose to stop or proceed further. They control how deep they go with each layered draw, empowered to end whenever they desire.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function StepWiseOverview() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="mx-auto max-w-2xl px-6 py-24 md:py-32">
        {/* Intro */}
        <motion.div
          className="flex items-start gap-6 sm:gap-8 mb-16"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="mt-1.5 shrink-0 h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 rounded-full" style={{ backgroundColor: '#FF4500' }} />
          <p className="text-lg sm:text-xl leading-[1.9] text-foreground/60">
            A StepWise approach is a carefully titrated system delivered to honor the nervous system —
            giving both the time and the energetic space to navigate whatever comes up, meeting each
            moment with compassion and curiosity.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex gap-6 sm:gap-8"
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              {/* Number */}
              <span
                className="shrink-0 w-[1.875rem] sm:w-[2.25rem] text-center text-3xl sm:text-4xl font-bold tracking-tight tabular-nums"
                style={{ color: i % 3 === 0 ? '#FFA500' : i % 3 === 1 ? '#FF4500' : '#800080' }}
              >
                {step.number}
              </span>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base sm:text-lg leading-[1.8] text-foreground/55">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Closing insight */}
        <motion.p
          className="mt-16 text-lg sm:text-xl leading-[1.9] font-medium"
          style={{ color: '#800080' }}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          This approach supports individuals in processing trauma in a way that a full-release method bypasses — honoring the body's natural rhythm for integration.
        </motion.p>
      </div>
    </section>
  );
}
