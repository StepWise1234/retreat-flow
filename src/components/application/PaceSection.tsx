import { motion } from 'framer-motion';
import { BookOpen, Brain, Heart, Users, Sparkles, Shield } from 'lucide-react';
import silhouetteImg from '@/assets/pace-silhouette.png';
import OrbitalTimeline, { type OrbitalItem } from './OrbitalTimeline';

const TRAINING_FEATURES: OrbitalItem[] = [
  {
    id: 1,
    title: 'Online Learning',
    subtitle: 'Pre-retreat coursework',
    content:
      'Complete foundational training modules at your own pace before arriving. Covers neuroscience of psychedelics, ethics, and safety protocols.',
    icon: BookOpen,
  },
  {
    id: 2,
    title: 'Nervous System',
    subtitle: 'Somatic science',
    content:
      'Understand the autonomic nervous system, polyvagal theory, and how to track regulation states in yourself and your clients.',
    icon: Brain,
  },
  {
    id: 3,
    title: 'Integration',
    subtitle: 'Post-experience support',
    content:
      'Learn frameworks for helping clients metabolize and integrate their experiences into lasting, meaningful change.',
    icon: Heart,
  },
  {
    id: 4,
    title: 'Community',
    subtitle: 'Cohort-based learning',
    content:
      'Join an intimate cohort of fellow clinicians. Build relationships and a referral network that extends well beyond the training.',
    icon: Users,
  },
  {
    id: 5,
    title: 'Facilitation',
    subtitle: 'Mastery-level skills',
    content:
      'Develop advanced facilitation techniques including nervous system attunement, touch and energy interventions, and integrating challenging material.',
    icon: Sparkles,
  },
  {
    id: 6,
    title: 'Safety',
    subtitle: 'Screening & ethics',
    content:
      'Master comprehensive screening processes, contraindication assessment, informed consent, and ethical boundaries in clinical practice.',
    icon: Shield,
  },
];

export default function PaceSection() {
  return (
    <section className="relative overflow-hidden bg-background pb-0">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pt-24 md:pt-32 pb-0 min-h-[80vh]">

        {/* Left text — small body copy */}
        <motion.p
          className="hidden md:block absolute left-6 lg:left-12 top-[45%] -translate-y-1/2 max-w-[11rem] text-sm md:text-base leading-relaxed text-muted-foreground text-right z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          Learn the pace of your system as you expand regulation capacity, metabolize shifts, and repair wholeness.
        </motion.p>

        {/* Center composition — circle behind, silhouette overlapping, orbital around */}
        <div className="relative flex items-center justify-center">
          {/* Celadon circle */}
          <div
            className="absolute h-80 w-80 rounded-full sm:h-96 sm:w-96 md:h-[34rem] md:w-[34rem]"
            style={{
              left: '-12%',
              top: '10px',
              backgroundColor: 'hsl(160 30% 72%)',
            }}
          />

          {/* Silhouette — mix-blend-mode removes white bg */}
          <div
            className="relative z-10 h-[28rem] w-[22rem] sm:h-[34rem] sm:w-[26rem] md:h-[42rem] md:w-[32rem] translate-y-8"
            style={{ mixBlendMode: 'multiply' }}
          >
            <img
              src={silhouetteImg}
              alt="Calm silhouette profile with eyes closed"
              className="h-full w-full object-contain object-bottom"
            />
          </div>

        {/* Orbital timeline around the circle */}
          <div className="absolute inset-0 z-20" style={{ transform: 'translate(-340px, -340px)' }}>
            <OrbitalTimeline
              items={TRAINING_FEATURES}
              radius={300}
              mobileRadius={200}
            />
          </div>
        </div>

        {/* Right text — bold, large "less is more" */}
        <motion.p
          className="hidden md:block absolute right-[calc(12%-50px)] lg:right-[calc(15%-50px)] top-[45%] -translate-y-1/2 text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight text-foreground z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
        >
          less is
          <br />
          more
        </motion.p>

        {/* Mobile: text below */}
        <div className="md:hidden absolute bottom-4 left-0 right-0 px-6 text-center z-10">
          <motion.p
            className="text-3xl font-bold text-foreground mb-2 tracking-tight"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            less is more
          </motion.p>
          <motion.p
            className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            Learn the pace of your system as you expand regulation capacity, metabolize shifts, and repair wholeness.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
