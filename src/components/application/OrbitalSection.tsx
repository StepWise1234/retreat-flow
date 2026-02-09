import { BookOpen, Brain, Heart, Users, Sparkles, Shield } from 'lucide-react';
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
      'Join an intimate cohort of fellow clinicians. Group case consults, alumni calls, workshops and Advanced Trainings.',
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
      'Master system tracking to serve at the speed of your clients and trauma-informed interventions to integrate what arises.',
    icon: Shield,
  },
];

export default function OrbitalSection() {
  return (
    <section className="relative bg-background py-24 md:py-32">
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6">
        <div className="relative flex items-center justify-center w-full min-h-[600px] md:min-h-[700px]">
          <OrbitalTimeline
            items={TRAINING_FEATURES}
            radius={260}
            mobileRadius={175}
          />
        </div>
      </div>
    </section>
  );
}
