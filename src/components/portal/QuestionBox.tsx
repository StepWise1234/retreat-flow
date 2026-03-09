import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useParticipantQuestions, useSubmitQuestion } from '@/hooks/useParticipantQuestions';
import { formatDistanceToNow } from 'date-fns';

export function QuestionBox() {
  const [question, setQuestion] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { questions, isLoading } = useParticipantQuestions();
  const submitQuestion = useSubmitQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || submitQuestion.isPending) return;

    try {
      await submitQuestion.mutateAsync(question.trim());
      setQuestion('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit question:', error);
    }
  };

  const pendingQuestions = questions.filter(q => q.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#3B82F612', color: '#3B82F6' }}
          >
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground/80">
              Have a Question?
            </h3>
            <p className="text-sm text-foreground/45">
              Ask us directly. We'll respond via Signal (if we have your handle) or email.
            </p>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full min-h-[100px] p-4 pr-12 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-foreground/80 placeholder:text-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all"
            disabled={submitQuestion.isPending}
          />
          <button
            type="submit"
            disabled={!question.trim() || submitQuestion.isPending}
            className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {submitQuestion.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex items-center gap-2 text-green-600"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Question sent! We'll respond via Signal or email.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Previous Questions */}
      {questions.length > 0 && (
        <div className="border-t border-foreground/[0.06]">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
          >
            <span>
              {pendingQuestions.length > 0
                ? `${pendingQuestions.length} pending question${pendingQuestions.length > 1 ? 's' : ''}`
                : 'Your previous questions'}
            </span>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 space-y-3">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg bg-foreground/[0.02] border border-foreground/[0.04]"
                    >
                      <p className="text-sm text-foreground/70 whitespace-pre-wrap">{q.question}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-foreground/40">
                        <span>{formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}</span>
                        <span>·</span>
                        <span
                          className={
                            q.status === 'pending'
                              ? 'text-amber-500'
                              : q.status === 'responded'
                              ? 'text-green-500'
                              : 'text-foreground/40'
                          }
                        >
                          {q.status === 'pending' ? 'Awaiting response' : q.status === 'responded' ? 'Responded' : 'Closed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
