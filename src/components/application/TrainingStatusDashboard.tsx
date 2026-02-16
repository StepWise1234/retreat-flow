import { motion } from 'framer-motion';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { MapPin, Users, Clock, ChevronRight } from 'lucide-react';

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
      { id: 'b1', title: 'Beginning Level — Cohort 7', date: 'Sep 12–18, 2026', location: 'Tulum, Mexico', spotsTotal: 6, spotsFilled: 2, status: 'open' },
      { id: 'b2', title: 'Beginning Level — Cohort 8', date: 'Nov 6–12, 2026', location: 'Oaxaca, Mexico', spotsTotal: 6, spotsFilled: 5, status: 'limited' },
      { id: 'b3', title: 'Beginning Level — Cohort 9', date: 'Jan 15–21, 2027', location: 'Playa del Carmen, Mexico', spotsTotal: 6, spotsFilled: 6, status: 'waitlist' },
    ],
  },
  intermediate: {
    color: '#FF4500',
    label: 'Intermediate',
    items: [
      { id: 'i1', title: 'Intermediate Level — Cohort 3', date: 'Oct 3–10, 2026', location: 'San Miguel de Allende, Mexico', spotsTotal: 6, spotsFilled: 3, status: 'open' },
      { id: 'i2', title: 'Intermediate Level — Cohort 4', date: 'Feb 7–14, 2027', location: 'Merida, Mexico', spotsTotal: 6, spotsFilled: 6, status: 'waitlist' },
    ],
  },
  advanced: {
    color: '#800080',
    label: 'Advanced',
    items: [
      { id: 'a1', title: 'Advanced Level — Cohort 1', date: 'Dec 5–14, 2026', location: 'Nosara, Costa Rica', spotsTotal: 6, spotsFilled: 4, status: 'limited' },
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
        {Math.max(total - filled, 0)} of {total} spots
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

      <div className="relative mx-auto max-w-3xl px-6 py-20 md:py-28">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground/85 text-center mb-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Upcoming Trainings
        </motion.h2>
        <motion.p
          className="text-center text-lg text-foreground/50 mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Find your cohort — seats fill quickly.
        </motion.p>

        <div className="space-y-12">
          {Object.entries(trainings).map(([key, level], levelIdx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: levelIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Level header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="h-4 w-4 rounded-full shrink-0" style={{ backgroundColor: level.color }} />
                <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground/80">
                  {level.label}
                </h3>
              </div>

              {/* Training cards */}
              <div className="space-y-3">
                {level.items.map((training, i) => (
                  <motion.div
                    key={training.id}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="group relative rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-5 hover:border-foreground/10 transition-all duration-300 cursor-pointer"
                    style={{ boxShadow: `0 1px 3px ${level.color}08` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-semibold text-foreground/80 text-base">{training.title}</h4>
                          <StatusBadge status={training.status} color={level.color} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/45">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {training.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {training.location}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className="hidden sm:block h-5 w-5 text-foreground/20 group-hover:text-foreground/40 transition-colors shrink-0 mt-1"
                      />
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
