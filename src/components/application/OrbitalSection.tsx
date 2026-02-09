import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, Heart, Users, Sparkles, Shield, ChevronDown } from 'lucide-react';
import type { ElementType } from 'react';
import meditationSilhouette from '@/assets/meditation-silhouette.png';

interface TrainingItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: ElementType;
  accentColor: string;
}

const TRAINING_FEATURES: TrainingItem[] = [
  {
    id: 1,
    title: 'Online Learning',
    subtitle: 'Pre-retreat coursework',
    content:
      'Complete foundational training modules at your own pace before arriving. Covers neuroscience of psychedelics, ethics, and safety protocols.',
    icon: BookOpen,
    accentColor: '#FFA500',
  },
  {
    id: 2,
    title: 'Nervous System',
    subtitle: 'Somatic science',
    content:
      'Understand the autonomic nervous system, polyvagal theory, and how to track regulation states in yourself and your clients.',
    icon: Brain,
    accentColor: '#FF4500',
  },
  {
    id: 3,
    title: 'Integration',
    subtitle: 'Post-experience support',
    content:
      'Learn frameworks for helping clients metabolize and integrate their experiences into lasting, meaningful change.',
    icon: Heart,
    accentColor: '#800080',
  },
  {
    id: 4,
    title: 'Community',
    subtitle: 'Cohort-based learning',
    content:
      'Join an intimate cohort of fellow clinicians. Group case consults, alumni calls, workshops and Advanced Trainings.',
    icon: Users,
    accentColor: '#FFA500',
  },
  {
    id: 5,
    title: 'Facilitation',
    subtitle: 'Mastery-level skills',
    content:
      'Develop advanced facilitation techniques including nervous system attunement, touch and energy interventions, and integrating challenging material.',
    icon: Sparkles,
    accentColor: '#FF4500',
  },
  {
    id: 6,
    title: 'Safety',
    subtitle: 'Screening & ethics',
    content:
      'Master system tracking to serve at the speed of your clients and trauma-informed interventions to integrate what arises.',
    icon: Shield,
    accentColor: '#800080',
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: TrainingItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="border-b border-foreground/10 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 py-5 text-left transition-colors duration-200 group"
      >
        {/* Accent dot */}
        <span
          className="shrink-0 h-3 w-3 rounded-full transition-transform duration-300"
          style={{
            backgroundColor: item.accentColor,
            transform: isOpen ? 'scale(1.4)' : 'scale(1)',
          }}
        />

        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300"
          style={{
            backgroundColor: isOpen
              ? `${item.accentColor}20`
              : 'hsl(var(--muted) / 0.5)',
          }}
        >
          <Icon
            size={18}
            className="transition-colors duration-300"
            style={{ color: isOpen ? item.accentColor : 'hsl(var(--muted-foreground))' }}
          />
        </div>

        {/* Title & subtitle */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold tracking-tight transition-colors duration-300"
            style={{ color: isOpen ? item.accentColor : 'hsl(var(--foreground))' }}
          >
            {item.title}
          </h3>
          <p className="text-sm text-foreground/40">{item.subtitle}</p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={18}
          className="shrink-0 text-foreground/30 transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 pl-[4.25rem] pr-4 text-base leading-[1.9] text-foreground/50">
              {item.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrbitalSection() {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        {/* Section header */}
        <motion.div
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            StepWise Training
          </h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: '#FFA500' }} />
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: '#FF4500' }} />
            <span className="block h-2 w-2 rounded-full" style={{ backgroundColor: '#800080' }} />
          </div>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Accordion */}
          <div className="order-2 lg:order-1">
            {TRAINING_FEATURES.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
                index={index}
              />
            ))}
          </div>

          {/* Silhouette image */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full max-w-sm lg:max-w-md">
              <img
                src={meditationSilhouette}
                alt="Silhouette of a person in peaceful meditation with eyes closed"
                className="w-full h-auto object-contain"
                loading="lazy"
              />
              {/* Subtle accent glow behind silhouette */}
              <div
                className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-full"
                style={{
                  background:
                    'radial-gradient(ellipse at center, #800080 0%, #FF4500 40%, transparent 70%)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
