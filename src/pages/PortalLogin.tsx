import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import FloatingLogo from '@/components/application/FloatingLogo';

type AuthMode = 'choose' | 'magic';

const DOMAIN_TYPOS: Record<string, string> = {
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotnail.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'protonnmail.com': 'protonmail.com',
  'pm.con': 'pm.me',
  'pm,me': 'pm.me',
};

function getEmailTypoHint(value: string): string | null {
  const parts = value.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1];
  const suggestion = DOMAIN_TYPOS[domain];
  if (!suggestion) return null;
  return `Did you mean ${parts[0]}@${suggestion}?`;
}

export default function PortalLogin() {
  const { user, loading, signInWithMagicLink } = usePortalAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const typoHint = getEmailTypoHint(email);

  if (loading) return null;
  if (user) return <Navigate to="/portal" replace />;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setAuthMode('magic');
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
              <form onSubmit={handleEmailSubmit} className="relative">
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
              </form>

              {/* Magic link */}
              {email.trim() && (
                <motion.form
                  onSubmit={handleMagicLink}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {typoHint && (
                    <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {typoHint}
                    </p>
                  )}
                  <p className="text-sm text-foreground/50 text-center">
                    We'll send a sign-in link to <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-xs text-foreground/40 text-center">
                    If you do not see it, check spam/promotions and wait up to 2 minutes.
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
                    Clear email
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
