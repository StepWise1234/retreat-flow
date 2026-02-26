import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BedDouble, Play, ChevronRight } from 'lucide-react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { useApplication } from '@/hooks/useApplication';

const cards = [
  {
    to: '/portal/application',
    icon: FileText,
    color: '#FFA500',
    title: 'Your Application',
    description: 'Review and edit the information you submitted.',
  },
  {
    to: '/portal/accommodation',
    icon: BedDouble,
    color: '#FF4500',
    title: 'Accommodation',
    description: 'Choose your bedroom, dietary preferences & special needs.',
  },
  {
    to: '/portal/course',
    icon: Play,
    color: '#800080',
    title: 'Online Course',
    description: 'Access your pre-training video curriculum on Vimeo.',
  },
];

export default function PortalDashboard() {
  const { user } = usePortalAuth();
  const { application } = useApplication();

  const displayName = application?.preferred_name || application?.first_name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div>
        <motion.h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground/85"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Welcome back, {displayName}
        </motion.h1>
        <motion.p
          className="mt-2 text-lg text-foreground/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Everything you need for your StepWise training journey.
        </motion.p>
      </div>

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={card.to}
              className="group block rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-foreground/[0.12] hover:shadow-lg hover:-translate-y-1"
              style={{ boxShadow: `0 2px 8px ${card.color}08` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${card.color}12`, color: card.color }}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground/80 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-foreground/45 leading-relaxed mb-4">
                {card.description}
              </p>
              <span
                className="inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200"
                style={{ color: card.color }}
              >
                Open
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
