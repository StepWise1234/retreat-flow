import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import FloatingLogo from '@/components/application/FloatingLogo';

export default function PortalLogin() {
  const { user, loading, signInWithMagicLink } = usePortalAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/portal" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
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
          {/* Brand dots */}
          <div className="flex justify-center gap-2.5 mb-8">
            {['#FFA500', '#FF4500', '#800080'].map((c) => (
              <span key={c} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground/85 text-center mb-2">
            Participant Portal
          </h1>
          <p className="text-center text-foreground/50 mb-10">
            Sign in with the email you used on your application.
          </p>

          {sent ? (
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-[#FFA500]/10 flex items-center justify-center">
                <Check className="h-7 w-7 text-[#FFA500]" />
              </div>
              <p className="text-lg text-foreground/70">
                Check your inbox! We sent a magic link to{' '}
                <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <p className="text-sm text-foreground/40">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl border border-foreground/10 bg-background/80 backdrop-blur-sm pl-12 pr-4 py-3.5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/30 focus:border-[#FFA500]/50 transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

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
                {submitting ? 'Sending…' : 'Send Magic Link'}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
