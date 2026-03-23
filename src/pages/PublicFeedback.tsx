import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle2, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackData {
  first_name: string;
  last_name: string;
  email: string;
  training_attended: string;
  overall_rating: number;
  content_rating: number;
  facilitator_rating: number;
  venue_rating: number;
  meals_rating: number;
  most_valuable: string;
  improvements: string;
  would_recommend: boolean | null;
  testimonial: string;
  can_use_testimonial: boolean;
  additional_comments: string;
}

const initialFeedback: FeedbackData = {
  first_name: '',
  last_name: '',
  email: '',
  training_attended: '',
  overall_rating: 0,
  content_rating: 0,
  facilitator_rating: 0,
  venue_rating: 0,
  meals_rating: 0,
  most_valuable: '',
  improvements: '',
  would_recommend: null,
  testimonial: '',
  can_use_testimonial: false,
  additional_comments: '',
};

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground/70">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hovered || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-foreground/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PublicFeedback() {
  const [feedback, setFeedback] = useState<FeedbackData>(initialFeedback);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFeedback = (key: keyof FeedbackData, value: any) => {
    setFeedback((prev) => ({ ...prev, [key]: value }));
  };

  const steps = [
    {
      title: 'Your Information',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={feedback.first_name}
                onChange={(e) => updateFeedback('first_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                placeholder="Your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={feedback.last_name}
                onChange={(e) => updateFeedback('last_name', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                placeholder="Your last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={feedback.email}
              onChange={(e) => updateFeedback('email', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Which training did you attend? *
            </label>
            <input
              type="text"
              value={feedback.training_attended}
              onChange={(e) => updateFeedback('training_attended', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              placeholder="e.g., March 2026 Beginning Training"
            />
          </div>
        </div>
      ),
      isValid: feedback.first_name.trim() && feedback.last_name.trim() && feedback.email.trim() && feedback.training_attended.trim(),
    },
    {
      title: 'Overall Experience',
      content: (
        <div className="space-y-8">
          <StarRating
            label="How would you rate your overall training experience?"
            value={feedback.overall_rating}
            onChange={(v) => updateFeedback('overall_rating', v)}
          />
          <StarRating
            label="How would you rate the training content and curriculum?"
            value={feedback.content_rating}
            onChange={(v) => updateFeedback('content_rating', v)}
          />
          <StarRating
            label="How would you rate the facilitators?"
            value={feedback.facilitator_rating}
            onChange={(v) => updateFeedback('facilitator_rating', v)}
          />
        </div>
      ),
      isValid: feedback.overall_rating > 0 && feedback.content_rating > 0 && feedback.facilitator_rating > 0,
    },
    {
      title: 'Venue & Meals',
      content: (
        <div className="space-y-8">
          <StarRating
            label="How would you rate the venue and accommodations?"
            value={feedback.venue_rating}
            onChange={(v) => updateFeedback('venue_rating', v)}
          />
          <StarRating
            label="How would you rate the meals?"
            value={feedback.meals_rating}
            onChange={(v) => updateFeedback('meals_rating', v)}
          />
        </div>
      ),
      isValid: feedback.venue_rating > 0 && feedback.meals_rating > 0,
    },
    {
      title: 'Your Thoughts',
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              What was the most valuable part of your training experience?
            </label>
            <textarea
              value={feedback.most_valuable}
              onChange={(e) => updateFeedback('most_valuable', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              rows={4}
              placeholder="Share what stood out to you..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              What could we improve for future trainings?
            </label>
            <textarea
              value={feedback.improvements}
              onChange={(e) => updateFeedback('improvements', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              rows={4}
              placeholder="Your suggestions help us grow..."
            />
          </div>
        </div>
      ),
      isValid: true,
    },
    {
      title: 'Recommendation',
      content: (
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-4">
              Would you recommend StepWise trainings to others?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateFeedback('would_recommend', true)}
                className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                  feedback.would_recommend === true
                    ? 'border-green-500 bg-green-500/10 text-green-600'
                    : 'border-foreground/10 hover:border-foreground/20'
                }`}
              >
                Yes, absolutely!
              </button>
              <button
                type="button"
                onClick={() => updateFeedback('would_recommend', false)}
                className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                  feedback.would_recommend === false
                    ? 'border-red-500 bg-red-500/10 text-red-600'
                    : 'border-foreground/10 hover:border-foreground/20'
                }`}
              >
                Not right now
              </button>
            </div>
          </div>
        </div>
      ),
      isValid: feedback.would_recommend !== null,
    },
    {
      title: 'Testimonial (Optional)',
      content: (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
              <p className="text-sm text-foreground/60">
                Would you like to share a testimonial? Your words help others discover StepWise and may be featured on our website or marketing materials.
              </p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Your testimonial
            </label>
            <textarea
              value={feedback.testimonial}
              onChange={(e) => updateFeedback('testimonial', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              rows={4}
              placeholder="Share your experience in your own words..."
            />
          </div>
          {feedback.testimonial && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={feedback.can_use_testimonial}
                onChange={(e) => updateFeedback('can_use_testimonial', e.target.checked)}
                className="w-5 h-5 rounded border-foreground/20 text-purple-500 focus:ring-purple-500/30"
              />
              <span className="text-sm text-foreground/60">
                I give permission to use my testimonial publicly (with my first name only)
              </span>
            </label>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-2">
              Any additional comments or questions?
            </label>
            <textarea
              value={feedback.additional_comments}
              onChange={(e) => updateFeedback('additional_comments', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-background/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              rows={3}
              placeholder="Anything else you'd like to share..."
            />
          </div>
        </div>
      ),
      isValid: true,
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('public_feedback').insert({
        first_name: feedback.first_name,
        last_name: feedback.last_name,
        email: feedback.email,
        training_attended: feedback.training_attended,
        overall_rating: feedback.overall_rating,
        content_rating: feedback.content_rating,
        facilitator_rating: feedback.facilitator_rating,
        venue_rating: feedback.venue_rating,
        meals_rating: feedback.meals_rating,
        most_valuable: feedback.most_valuable || null,
        improvements: feedback.improvements || null,
        would_recommend: feedback.would_recommend,
        testimonial: feedback.testimonial || null,
        can_use_testimonial: feedback.can_use_testimonial,
        additional_comments: feedback.additional_comments || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err: any) {
      console.error('Feedback submission error:', err);
      toast.error(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground/85 mb-3">
            Thank You!
          </h2>
          <p className="text-foreground/50">
            Your feedback has been submitted. We truly appreciate you taking the time to share your thoughts and help us improve.
          </p>
          <a
            href="https://stepwise.education"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Return to StepWise
          </a>
        </motion.div>
      </div>
    );
  }

  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="StepWise" className="h-8 mx-auto mb-6" />
          <motion.h1
            className="text-3xl font-bold tracking-tight text-foreground/85"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Training Feedback
          </motion.h1>
          <motion.p
            className="mt-2 text-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Help us improve by sharing your experience.
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-foreground/50 mb-2">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{currentStep.title}</span>
          </div>
          <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <motion.div
          className="rounded-2xl border border-foreground/[0.06] bg-white/80 backdrop-blur-sm p-8 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-foreground/80 mb-6">
                {currentStep.title}
              </h2>
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 text-foreground/50 hover:text-foreground/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!currentStep.isValid}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
