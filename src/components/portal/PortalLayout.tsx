import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Home as HomeIcon, BedDouble, Play, LogOut, Calendar } from 'lucide-react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/portal', icon: HomeIcon, label: 'Dashboard', end: true },
  { to: '/portal/application', icon: FileText, label: 'Application', end: false },
  { to: '/portal/accommodation', icon: BedDouble, label: 'Retreat', end: false },
  { to: '/portal/course', icon: Play, label: 'Online Course', end: false },
  { to: '/portal/events', icon: Calendar, label: 'Events', end: false },
];

export default function PortalLayout() {
  const { user, loading, signOut } = usePortalAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/portal/login" replace />;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Background pattern */}
      <div className="fixed inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] pointer-events-none">
        <AnimatedGridPattern
          numSquares={20}
          maxOpacity={0.04}
          duration={4}
          className="w-full h-full fill-foreground/5 stroke-foreground/5"
        />
      </div>

      {/* Top nav */}
      <header className="relative z-20 border-b border-foreground/[0.06] bg-[#fafafa]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <img src="/logo.svg" alt="StepWise" className="h-6" />

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-foreground/[0.06] text-foreground/90'
                      : 'text-foreground/45 hover:text-foreground/70 hover:bg-foreground/[0.03]'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground/40 hover:text-foreground/70 hover:bg-foreground/[0.03] transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-foreground/[0.04] px-4 py-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-foreground/[0.06] text-foreground/90'
                    : 'text-foreground/40 hover:text-foreground/60'
                )
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
