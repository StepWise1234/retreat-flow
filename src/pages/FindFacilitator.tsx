import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import FacilitatorHero from '@/components/application/FacilitatorHero';
import FloatingLogo from '@/components/application/FloatingLogo';
import SiteFooter from '@/components/application/SiteFooter';
import MadLibInput from '@/components/application/MadLibInput';
import MadLibTextarea from '@/components/application/MadLibTextarea';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';

export default function FindFacilitator() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    previousExperience: '',
    currentSupport: '',
    goals: '',
    howHeard: '',
    additionalInfo: '',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.email.trim()) {
      toast.error('Please provide at least your name and email');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingLogo />
      <FacilitatorHero />

      {/* Intro copy */}
      <section className="relative overflow-hidden bg-[#fafafa]">
        <div className="mx-auto max-w-2xl px-6 pt-20 md:pt-28 pb-12 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Work with a StepWise Facilitator
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-foreground/60 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            StepWise-trained facilitators practice in jurisdictions where 5-MeO-DMT is legally permitted. Each practitioner completes rigorous training in capacity-based, nervous-system-informed psychedelic-assisted therapy — ensuring your experience is held with the precision, safety, and clinical integrity you deserve.
          </motion.p>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-[#fafafa]">
        <div className="relative mx-auto max-w-3xl px-6 pb-16">
          <motion.div
            className="grid gap-8 md:grid-cols-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {[
              { num: '01', color: '#FFA500', title: 'Share Your Story', desc: 'Complete the brief intake form below so our concierge team understands your background, goals, and any clinical considerations.' },
              { num: '02', color: '#FF4500', title: 'Concierge Consultation', desc: 'A member of our team will reach out within 72 hours to discuss your needs, answer questions, and determine if StepWise is a good fit.' },
              { num: '03', color: '#800080', title: 'Facilitator Match', desc: 'Based on your profile and preferences, we connect you with a vetted StepWise-trained practitioner in a permitted jurisdiction.' },
            ].map((step) => (
              <div key={step.num} className="text-center md:text-left">
                <span className="text-5xl font-bold tracking-tight" style={{ color: step.color }}>{step.num}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Form or Thank You */}
      {submitted ? (
        <section className="relative overflow-hidden bg-[#fafafa]">
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]">
            <AnimatedGridPattern numSquares={30} maxOpacity={0.08} duration={4} className="w-full h-full fill-black/5 stroke-black/5" />
          </div>
          <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-24 flex flex-col items-center justify-center">
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground text-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Thank You
            </motion.h2>
            <div className="relative mt-4 w-full max-w-lg h-px z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#800080] to-transparent opacity-60" />
            </div>
            <motion.p
              className="text-lg sm:text-xl text-foreground/60 text-center max-w-xl z-10 leading-relaxed mt-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Our concierge team will be in touch within 72 hours to discuss next steps and answer any questions you may have.
            </motion.p>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-[#fafafa]">
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]">
            <AnimatedGridPattern numSquares={40} maxOpacity={0.06} duration={4} className="w-full h-full fill-black/5 stroke-black/5" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-6 sm:p-8 space-y-10"
            >
              {/* Intro sentence */}
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/60">
                <p>
                  My name is{' '}
                  <MadLibInput value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="first name" className="w-36 sm:w-44" />{' '}
                  <MadLibInput value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="last name" className="w-36 sm:w-44" />{' '}
                  and the best way to reach me is at{' '}
                  <MadLibInput value={form.email} onChange={(v) => update('email', v)} placeholder="email address" className="w-52 sm:w-64" />{' '}
                  or{' '}
                  <MadLibInput value={form.phone} onChange={(v) => update('phone', v)} placeholder="phone (optional)" className="w-40 sm:w-48" />.
                </p>

                <p>
                  I'm currently located in{' '}
                  <MadLibInput value={form.location} onChange={(v) => update('location', v)} placeholder="city, state/country" className="w-52 sm:w-64" />{' '}
                  and I'm open to traveling to a jurisdiction where this work is permitted.
                </p>

                <p>
                  My previous experience with psychedelic-assisted work or expanded states of consciousness is:
                </p>
                <MadLibTextarea
                  value={form.previousExperience}
                  onChange={(v) => update('previousExperience', v)}
                  placeholder="Share as much or as little as feels right — whether you've participated in ceremony, clinical trials, therapeutic settings, or this would be your first experience…"
                />

                <p>
                  I'm currently supported by the following healthcare or mental health professionals:
                </p>
                <MadLibTextarea
                  value={form.currentSupport}
                  onChange={(v) => update('currentSupport', v)}
                  placeholder="e.g., therapist, psychiatrist, physician, bodyworker, or 'I'm not currently working with anyone'…"
                />

                <p>
                  What I'm hoping to explore or address through this work:
                </p>
                <MadLibTextarea
                  value={form.goals}
                  onChange={(v) => update('goals', v)}
                  placeholder="There are no wrong answers here — whether it's personal growth, healing, spiritual exploration, or something you're still discovering…"
                />

                <p>
                  I heard about StepWise through{' '}
                  <MadLibInput value={form.howHeard} onChange={(v) => update('howHeard', v)} placeholder="referral, web search, practitioner…" className="w-52 sm:w-72" />.
                </p>

                <p>
                  Anything else you'd like our concierge team to know:
                </p>
                <MadLibTextarea
                  value={form.additionalInfo}
                  onChange={(v) => update('additionalInfo', v)}
                  placeholder="Questions, concerns, scheduling preferences, accessibility needs…"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-center pt-4">
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 rounded-full px-10 py-4 text-base font-semibold text-white transition-all duration-300 shadow-lg"
                  style={{ backgroundColor: '#800080' }}
                >
                  Submit Inquiry
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
