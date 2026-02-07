import { Link, useLocation } from 'react-router-dom';
import { Mountain, LayoutDashboard, FileText, MessageSquareText, Archive, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contact', label: 'Contact', icon: Users },
  { to: '/apply', label: 'Application Form', icon: FileText },
  { to: '/templates', label: 'Templates', icon: MessageSquareText },
  { to: '/archive', label: 'Archive', icon: Archive },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-page">
      <header className="sticky top-0 z-30 border-b bg-gradient-header backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-primary hover-lift">
            <Mountain className="h-5 w-5" />
            <span className="hidden sm:inline">Retreat Ops</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'nav-active-cosmic text-primary-foreground shadow-lg'
                      : 'text-muted-foreground nav-hover hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
