import { motion } from 'framer-motion';
import { Clock, Sparkles, Users, Heart, Brain, Shield, Zap } from 'lucide-react';

const intermediateWorkshops = [
  {
    number: '01',
    title: 'Nervous System + PTSD',
    icon: Brain,
    color: '#FFA500',
    description:
      'Advanced protocols for working with dysregulated nervous systems, complex trauma, and PTSD. Learn to track freeze, fawn, and flight responses in real time and guide clients through titrated release without overwhelm.',
    topics: [
      'Ultra-low dose application for gradual capacity building',
      'Expanding each client\'s window of tolerance session by session',
      'Calibrating dosing to the precise edge of regulation capacity',
      'Building resilience and trust in the body\'s processing ability',
    ],
  },
  {
    number: '02',
    title: 'Touch + Parts-Work',
    icon: Heart,
    color: '#FF4500',
    description:
      'Somatic touch techniques integrated with parts-work (IFS-informed). Develop the sensitivity to work with wounded inner-child states, body-held memories, and the delicate negotiation between protector and exile parts during session.',
    topics: [
      'Reading and responding to subtle energetic shifts',
      'Working with blocked or stagnant energy patterns',
      'Intentional touch as a vehicle for somatic release',
      'Energetic attunement and co-regulation in session',
    ],
  },
  {
    number: '03',
    title: 'Relational Intelligence',
    icon: Users,
    color: '#800080',
    description:
      'Attachment wound repair through the relational field. Explore how facilitator-client dynamics mirror early attachment patterns, and learn to use the therapeutic relationship itself as the vehicle for healing insecure attachment.',
    topics: [
      'Group facilitation with multi-threaded relational tracking',
      'Holding relational repair work in a group container',
      'Tracking multiple relational threads simultaneously',
      'Co-regulation and witnessed vulnerability as catalysts',
    ],
  },
];

const advancedModules = [
  {
    icon: Zap,
    title: 'Full-Release Session Facilitation',
    description: 'Complete dissolution protocols and the art of holding space through ego-dissolution experiences. Your nervous system has been trained alongside your clinical skills — this is where art meets science.',
  },
  {
    icon: Shield,
    title: 'Crisis Navigation & Deep-State Support',
    description: 'Advanced techniques for navigating the most intense moments of a full-release session. Learn to remain grounded and attuned when the depth of the work challenges every capacity you\'ve built.',
  },
  {
    icon: Sparkles,
    title: 'Post-Session Integration Frameworks',
    description: 'Transformative experiences require equally transformative integration. Develop frameworks that honor the profundity of full-release work and support lasting change in your clients\' lives.',
  },
  {
    icon: Users,
    title: 'Supervision & Trainer Certification Pathway',
    description: 'Begin the transition from practitioner to mentor. Advanced training opens the pathway to supervising newer facilitators and contributing to the evolving StepWise evidence base.',
  },
];

interface CoursePlaceholderProps {
  level: 'intermediate' | 'advanced';
}

export default function CoursePlaceholder({ level }: CoursePlaceholderProps) {
  if (level === 'intermediate') {
    return <IntermediatePlaceholder />;
  }
  return <AdvancedPlaceholder />;
}

function IntermediatePlaceholder() {
  return (
    <div className="space-y-6">
      {/* Status banner */}
      <motion.div
        className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-6 py-5 flex items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #FF4500, #800080)' }}>
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/70">Online curriculum in development</p>
          <p className="text-xs text-foreground/40 mt-0.5">Workshop preparation videos will appear here before your in-person weekend.</p>
        </div>
      </motion.div>

      {/* Workshop cards */}
      <div className="space-y-4">
        {intermediateWorkshops.map((ws, i) => (
          <motion.div
            key={ws.number}
            className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 py-5">
              <div className="flex items-start gap-4">
                <span
                  className="shrink-0 text-3xl font-bold tracking-tight tabular-nums"
                  style={{ color: ws.color }}
                >
                  {ws.number}
                </span>
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <ws.icon className="h-5 w-5 shrink-0" style={{ color: ws.color }} />
                    <h3 className="text-lg font-bold tracking-tight text-foreground/85">{ws.title}</h3>
                  </div>
                  <p className="text-sm leading-[1.8] text-foreground/50">{ws.description}</p>
                  <ul className="grid gap-2 pt-1">
                    {ws.topics.map((topic, j) => (
                      <motion.li
                        key={j}
                        className="flex items-start gap-2.5 text-foreground/55"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + j * 0.05 + 0.2 }}
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: ws.color }} />
                        <span className="text-sm leading-relaxed">{topic}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AdvancedPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Status banner */}
      <motion.div
        className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-6 py-5 flex items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #800080, #FF4500)' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground/70">Invitation-only — advanced curriculum</p>
          <p className="text-xs text-foreground/40 mt-0.5">Your trainers will assess your readiness based on demonstrated competence, nervous system capacity, and clinical maturity.</p>
        </div>
      </motion.div>

      {/* Intro text */}
      <motion.div
        className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-6 py-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <p className="text-base leading-[1.9] text-foreground/55">
          The culmination of the StepWise path. Advanced training prepares you for{' '}
          <span className="font-semibold text-foreground/75">full-release 5-MeO-DMT sessions</span>{' '}
          — the most profound and demanding work in the field. By this stage, your nervous system has been trained alongside your clinical skills. You'll learn to facilitate complete ego-dissolution experiences with the confidence that comes from hundreds of hours of graduated practice.
        </p>
      </motion.div>

      {/* Module cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {advancedModules.map((mod, i) => (
          <motion.div
            key={mod.title}
            className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #800080, #FF4500)' }}>
                <mod.icon className="h-4.5 w-4.5 text-white" />
              </div>
              <h3 className="text-sm font-bold tracking-tight text-foreground/80">{mod.title}</h3>
            </div>
            <p className="text-sm leading-[1.75] text-foreground/45">{mod.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
