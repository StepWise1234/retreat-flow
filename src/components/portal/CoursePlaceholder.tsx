import { motion } from 'framer-motion';
import { Clock, Sparkles, Users, Heart, Brain, Shield, Zap, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/* ─── Training openings data ─── */

interface Training {
  id: string;
  title: string;
  date: string;
  location: string;
  spotsTotal: number;
  spotsFilled: number;
  status: 'open' | 'limited' | 'waitlist';
  priceId: string;
  price: string;
}

const beginningTrainings: Training[] = [
  { id: 'b1', title: 'Cohort 7', date: 'Jun 1–4, 2026', location: 'Whistler, B.C. Canada', spotsTotal: 6, spotsFilled: 2, status: 'open', priceId: 'price_1T4YRvEgzXpjaC9ze8I3IBMe', price: '$3,500' },
  { id: 'b2', title: 'Cohort 8', date: 'Jul 20–23, 2026', location: 'Tofino, B.C. Canada', spotsTotal: 6, spotsFilled: 2, status: 'open', priceId: 'price_1T4YRvEgzXpjaC9ze8I3IBMe', price: '$3,500' },
  { id: 'b3', title: 'Cohort 9', date: 'Aug 24–27, 2026', location: 'Salt Spring Island, B.C. Canada', spotsTotal: 6, spotsFilled: 0, status: 'open', priceId: 'price_1T4YRvEgzXpjaC9ze8I3IBMe', price: '$3,500' },
];

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
    training: { id: 'i1', date: 'Oct 3–5, 2026', location: 'Nelson, B.C. Canada', spotsTotal: 6, spotsFilled: 3, status: 'open' as const, priceId: 'price_1T4yupEgzXpjaC9zmLB8LkMv', price: '$2,500' },
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
    training: { id: 'i2', date: 'Nov 14–16, 2026', location: 'Revelstoke, B.C. Canada', spotsTotal: 6, spotsFilled: 6, status: 'waitlist' as const, priceId: 'price_1T4YU0EgzXpjaC9zKShLmJKf', price: '$2,500' },
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
    training: { id: 'i3', date: 'Feb 7–9, 2027', location: 'Whistler, B.C. Canada', spotsTotal: 6, spotsFilled: 1, status: 'open' as const, priceId: 'price_1T4YlWEgzXpjaC9z9vXiUVSg', price: '$2,500' },
  },
];

const advancedTraining: Training = {
  id: 'a1', title: 'Advanced Level', date: 'Dec 5–14, 2026', location: 'Nosara, Costa Rica', spotsTotal: 6, spotsFilled: 4, status: 'limited', priceId: 'price_1T4YbMEgzXpjaC9zptVtzx1S', price: '$2,500',
};

const advancedModules = [
  { icon: Zap, title: 'Full-Release Session Facilitation', description: 'Complete dissolution protocols and the art of holding space through ego-dissolution experiences.' },
  { icon: Shield, title: 'Crisis Navigation & Deep-State Support', description: 'Advanced techniques for navigating the most intense moments of a full-release session.' },
  { icon: Sparkles, title: 'Post-Session Integration Frameworks', description: 'Develop frameworks that honor the profundity of full-release work and support lasting change.' },
  { icon: Users, title: 'Supervision & Trainer Certification', description: 'Begin the transition from practitioner to mentor and contribute to the evolving evidence base.' },
];

/* ─── Shared components ─── */

function CapacityBar({ filled, total, color }: { filled: number; total: number; color: string }) {
  const pct = Math.min((filled / total) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-medium text-foreground/50 tabular-nums whitespace-nowrap">
        {total - filled > 0 ? `${total - filled} available` : 'waitlist'}
      </span>
    </div>
  );
}

function StatusDot({ status, color }: { status: Training['status']; color: string }) {
  if (status === 'waitlist') return null;
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
    </span>
  );
}

function SignUpButton({ priceId, price, status, color }: { priceId: string; price: string; status: Training['status']; color: string }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-training-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 shrink-0',
        status === 'waitlist'
          ? 'bg-foreground/5 text-foreground/50 hover:bg-foreground/10'
          : 'text-white hover:brightness-110'
      )}
      style={status !== 'waitlist' ? { backgroundColor: color } : undefined}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {status === 'waitlist' ? 'Join Waitlist' : price}
          <ArrowRight className="h-3.5 w-3.5" />
        </>
      )}
    </button>
  );
}

function TrainingCard({ training, color }: { training: Training; color: string }) {
  return (
    <div
      className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-4 py-3"
      style={{ boxShadow: `0 1px 3px ${color}08` }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot status={training.status} color={color} />
          <h4 className="font-semibold text-foreground/80 text-sm truncate">{training.title}</h4>
          {training.status === 'limited' && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
              Limited
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-foreground/45 shrink-0">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {training.date}
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {training.location}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <CapacityBar filled={training.spotsFilled} total={training.spotsTotal} color={color} />
        </div>
        <SignUpButton priceId={training.priceId} price={training.price} status={training.status} color={color} />
      </div>
    </div>
  );
}

/* ─── Exported components ─── */

interface CoursePlaceholderProps {
  level: 'intermediate' | 'advanced';
}

export default function CoursePlaceholder({ level }: CoursePlaceholderProps) {
  if (level === 'intermediate') return <IntermediatePlaceholder />;
  return <AdvancedPlaceholder />;
}

export function BeginningTrainingCards() {
  return (
    <motion.div
      className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">Upcoming Cohorts</h3>
        <span className="text-xs text-foreground/30">{beginningTrainings.length} sessions</span>
      </div>
      <div className="p-4 space-y-2">
        {beginningTrainings.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 + 0.25 }}
          >
            <TrainingCard training={t} color="#FFA500" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function IntermediatePlaceholder() {
  return (
    <div className="space-y-6">
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
                <span className="shrink-0 text-3xl font-bold tracking-tight tabular-nums" style={{ color: ws.color }}>
                  {ws.number}
                </span>
                <div className="space-y-3 min-w-0 flex-1">
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
            {/* Training opening */}
            <div className="px-4 pb-4 pt-0">
              <TrainingCard
                training={{ id: ws.training.id, title: ws.title, ...ws.training }}
                color={ws.color}
              />
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

      <motion.div
        className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-6 py-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <p className="text-base leading-[1.9] text-foreground/55">
          The culmination of the StepWise path. Advanced training prepares you for{' '}
          <span className="font-semibold text-foreground/75">full-release 5-MeO-DMT sessions</span>{' '}
          — the most profound and demanding work in the field. By this stage, your nervous system has been trained alongside your clinical skills.
        </p>
      </motion.div>

      {/* Training opening */}
      <motion.div
        className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
      >
        <div className="px-6 py-4 border-b border-foreground/[0.06]">
          <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">Next Training</h3>
        </div>
        <div className="p-4">
          <TrainingCard training={advancedTraining} color="#800080" />
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {advancedModules.map((mod, i) => (
          <motion.div
            key={mod.title}
            className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 space-y-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #800080, #FF4500)' }}>
                <mod.icon className="h-4 w-4 text-white" />
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
