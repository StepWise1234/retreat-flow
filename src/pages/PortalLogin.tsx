import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check, Lock, KeyRound, UserPlus } from 'lucide-react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import FloatingLogo from '@/components/application/FloatingLogo';

type AuthMode = 'choose' | 'signin' | 'setup' | 'magic';

export default function PortalLogin() {
  const { user, loading, signInWithMagicLink, signInWithPassword, signUpWithPassword } = usePortalAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('choose');

  if (loading) return null;
  if (user) return <Navigate to="/portal" replace />;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    // Show options after email is entered
    setAuthMode('choose');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: authError } = await signInWithPassword(email.trim(), password);
    setSubmitting(false);
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. If you haven\'t set up a password yet, click "First time? Set password".');
      } else {
        setError(authError.message);
      }
    }
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a password');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: authError } = await signUpWithPassword(email.trim(), password);
    setSubmitting(false);
    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        // Email exists in system - try signing in with the password they just entered
        // If it fails, they need to use a different password or the account has a different password
        setSubmitting(true);
        const { error: signInError } = await signInWithPassword(email.trim(), password);
        setSubmitting(false);
        if (signInError) {
          setError('This email is already registered. If you forgot your password, use the Magic Link option to sign in.');
        }
      } else {
        setError(authError.message);
      }
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: authError } = await signInWithMagicLink(email.trim());
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  const resetForm = () => {
    setAuthMode('choose');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <FloatingLogo />

      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.06}
          duration={4}
          className="w-full h-full fill-foreground/5 stroke-foreground/5"
        />
      </div>

      <div className="relative flex-1 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src="/logo.svg" alt="StepWise" className="h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground/85 text-center mb-2">
            Participant Portal
          </h1>
          <p className="text-center text-foreground/50 mb-10">
            Sign in with the email you used on your application.
          </p>

          {sent ? (
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Green glow behind card */}
              <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-3xl -z-10" />

              {/* Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-3">
                <h2 className="text-xl font-semibold text-foreground">
                  Check your email
                </h2>
                <p className="text-foreground/70">
                  We sent a login link to{' '}
                  <span className="font-semibold text-foreground">{email}</span>
                </p>
                <p className="text-sm text-foreground/40">
                  Click the link in the email to sign in.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Email input - always visible */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authMode !== 'choose') resetForm();
                  }}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-foreground/10 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/30 focus:border-[#FFA500]/50 transition-all"
                />
              </div>

              {email.trim() && authMode === 'choose' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-foreground/50 text-center">How would you like to sign in?</p>

                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-background/80 hover:bg-foreground/5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFA500]/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-[#FFA500]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Sign in with password</p>
                      <p className="text-sm text-foreground/50">I already have a password</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('setup')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-background/80 hover:bg-foreground/5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <UserPlus className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">First time? Set password</p>
                      <p className="text-sm text-foreground/50">Create a password for your account</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('magic')}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-foreground/10 bg-background/80 hover:bg-foreground/5 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <KeyRound className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Send magic link</p>
                      <p className="text-sm text-foreground/50">Get a sign-in link via email</p>
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Sign in with password */}
              {authMode === 'signin' && (
                <motion.form
                  onSubmit={handleSignIn}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      autoFocus
                      className="w-full rounded-xl border border-foreground/10 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/30 focus:border-[#FFA500]/50 transition-all"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #FFA500, #FF4500)',
                      boxShadow: '0 4px 14px rgba(255, 69, 0, 0.25)',
                    }}
                  >
                    {submitting ? 'Signing in...' : 'Sign In'}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </motion.button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    Back to options
                  </button>
                </motion.form>
              )}

              {/* Set up password */}
              {authMode === 'setup' && (
                <motion.form
                  onSubmit={handleSetupPassword}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 8 characters)"
                      autoFocus
                      className="w-full rounded-xl border border-foreground/10 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/30 focus:border-[#FFA500]/50 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-foreground/10 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/30 focus:border-[#FFA500]/50 transition-all"
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    {submitting ? 'Setting up...' : 'Set Password & Sign In'}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </motion.button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    Back to options
                  </button>
                </motion.form>
              )}

              {/* Magic link */}
              {authMode === 'magic' && (
                <motion.form
                  onSubmit={handleMagicLink}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-foreground/50 text-center">
                    We'll send a sign-in link to <span className="font-medium text-foreground">{email}</span>
                  </p>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)',
                    }}
                  >
                    {submitting ? 'Sending...' : 'Send Magic Link'}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </motion.button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
                  >
                    Back to options
                  </button>
                </motion.form>
              )}

              {/* Initial state - no email yet */}
              {!email.trim() && (
                <p className="text-sm text-foreground/40 text-center">
                  Enter your email above to continue
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
