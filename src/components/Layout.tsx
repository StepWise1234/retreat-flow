import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mountain, LayoutDashboard, FileText, MessageSquareText, Archive, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/contact', label: 'Contact', icon: Users },
  { to: '/templates', label: 'Templates', icon: MessageSquareText },
  { to: '/archive', label: 'Archive', icon: Archive },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-page">
      <header className="sticky top-0 z-30 border-b bg-gradient-header backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-primary hover-lift">
            <Mountain className="h-5 w-5" />
            <span className="hidden sm:inline">Retreat Ops</span>
          </Link>

          <nav className="flex items-center gap-1 flex-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'nav-active-cosmic text-muted-foreground'
                      : 'text-muted-foreground nav-hover hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
