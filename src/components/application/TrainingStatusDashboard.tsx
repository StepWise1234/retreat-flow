import { motion } from 'framer-motion';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { MapPin, Users, Clock } from 'lucide-react';

interface Training {
  id: string;
  title: string;
  date: string;
  location: string;
  spotsTotal: number;
  spotsFilled: number;
  status: 'open' | 'limited' | 'waitlist';
}

const trainings: Record<string, { color: string; label: string; items: Training[] }> = {
  beginning: {
    color: '#FFA500',
    label: 'Beginning',
    items: [
      { id: 'b1', title: 'Beginning Level — Cohort 7', date: 'Jun 1–4, 2026', location: 'Whistler, B.C. Canada', spotsTotal: 6, spotsFilled: 2, status: 'open' },
      { id: 'b2', title: 'Beginning Level — Cohort 8', date: 'Jul 20–23, 2026', location: 'Tofino, B.C. Canada', spotsTotal: 6, spotsFilled: 2, status: 'open' },
      { id: 'b3', title: 'Beginning Level — Cohort 9', date: 'Aug 24–27, 2026', location: 'Salt Spring Island, B.C. Canada', spotsTotal: 6, spotsFilled: 0, status: 'open' },
    ],
  },
  intermediate: {
    color: '#FF4500',
    label: 'Intermediate',
    items: [
      { id: 'i1', title: 'Nervous System + PTSD', date: 'Oct 3–5, 2026', location: 'Nelson, B.C. Canada', spotsTotal: 6, spotsFilled: 3, status: 'open' },
      { id: 'i2', title: 'Touch + Parts-Work', date: 'Nov 14–16, 2026', location: 'Revelstoke, B.C. Canada', spotsTotal: 6, spotsFilled: 6, status: 'waitlist' },
      { id: 'i3', title: 'Relational Intelligence', date: 'Feb 7–9, 2027', location: 'Whistler, B.C. Canada', spotsTotal: 6, spotsFilled: 1, status: 'open' },
    ],
  },
  advanced: {
    color: '#800080',
    label: 'Advanced',
    items: [
      { id: 'a1', title: 'Advanced Level', date: 'Dec 5–14, 2026', location: 'Nosara, Costa Rica', spotsTotal: 6, spotsFilled: 4, status: 'limited' },
    ],
  },
};

function StatusBadge({ status, color }: { status: Training['status']; color: string }) {
  if (status === 'open') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${color}12`, color }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
        Open
      </span>
    );
  }
  if (status === 'limited') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${color}12`, color }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: color }} />
        </span>
        Limited Spots
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-foreground/5 text-foreground/50">
      <Clock className="h-3 w-3" />
      Waitlist
    </span>
  );
}

function CapacityBar({ filled, total, color }: { filled: number; total: number; color: string }) {
  const pct = Math.min((filled / total) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-foreground/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-xs font-medium text-foreground/50 tabular-nums whitespace-nowrap">
        {total - filled > 0 ? `${total - filled} available` : 'waitlist'}
      </span>
    </div>
  );
}

export default function TrainingStatusDashboard() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.08}
          duration={4}
          className="w-full h-full fill-foreground/5 stroke-foreground/5"
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-12 md:py-16">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground/85 text-center mb-2"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Upcoming Trainings
        </motion.h2>

        <div className="space-y-8">
          {Object.entries(trainings).map(([key, level], levelIdx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: levelIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Level header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: level.color }} />
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/80">
                  {level.label}
                </h3>
              </div>

              {/* Training cards */}
              <div className="space-y-1.5">
                {level.items.map((training, i) => (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="rounded-lg border border-foreground/[0.06] bg-background/60 backdrop-blur-sm px-4 py-2.5"
                    style={{ boxShadow: `0 1px 3px ${level.color}08` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <h4 className="font-semibold text-foreground/80 text-sm truncate">{training.title}</h4>
                        <StatusBadge status={training.status} color={level.color} />
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
                    <CapacityBar filled={training.spotsFilled} total={training.spotsTotal} color={level.color} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
