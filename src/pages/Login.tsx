import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Lock, UserPlus } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if already logged in
  if (!authLoading && user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      setLoading(false);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Account created! You are now signed in.');
      navigate('/dashboard', { replace: true });
    } else {
      const { error } = await signIn(email, password);
      setLoading(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#FFA500' }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#FF4500' }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#800080' }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">StepWise</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp ? 'Create your admin account' : 'Sign in to manage retreats'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            {isSignUp ? <UserPlus className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span>{isSignUp ? 'One-Time Admin Setup' : 'Admin Access Only'}</span>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-xs text-muted-foreground">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need to create an admin account? Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}
