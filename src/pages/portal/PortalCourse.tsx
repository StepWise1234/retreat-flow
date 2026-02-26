import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, FileText, Download, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { useApplication } from '@/hooks/useApplication';
import { useCourseVideos } from '@/hooks/useCourseVideos';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';

const BRAND_COLORS = ['#FFA500', '#FF4500', '#800080'] as const;

const levelConfig: Record<string, { label: string; color: string; gradient: string }> = {
  beginning: {
    label: 'Beginning',
    color: '#FFA500',
    gradient: 'linear-gradient(135deg, #FFA500, #FF4500)',
  },
  intermediate: {
    label: 'Intermediate',
    color: '#FF4500',
    gradient: 'linear-gradient(135deg, #FF4500, #800080)',
  },
  advanced: {
    label: 'Advanced',
    color: '#800080',
    gradient: 'linear-gradient(135deg, #800080, #FF4500)',
  },
};

/** Decorative brand circles */
function BrandCircles({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {BRAND_COLORS.map((c) => (
        <motion.div
          key={c}
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: c }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: BRAND_COLORS.indexOf(c) * 0.1 }}
        />
      ))}
    </div>
  );
}

export default function PortalCourse() {
  const { application, isLoading: appLoading } = useApplication();
  const level = application?.training_level || 'beginning';
  const config = levelConfig[level] || levelConfig.beginning;

  const { data: videos = [], isLoading: videosLoading } = useCourseVideos(level);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeVideo = videos.find((v) => v.id === activeVideoId) ?? videos[0] ?? null;
  const activeIndex = activeVideo ? videos.findIndex((v) => v.id === activeVideo.id) : 0;

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < videos.length - 1;
  const goTo = (i: number) => setActiveVideoId(videos[i].id);

  if (appLoading) {
    return <div className="text-center py-20 text-foreground/40">Loading…</div>;
  }

  if (!application) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-xl text-foreground/60">No application found</p>
        <p className="text-foreground/40">Your course will appear here once your application is linked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      {/* Hero header */}
      <div className="relative overflow-hidden px-6 sm:px-8 lg:px-10 pt-10 pb-12">
        {/* Decorative floating circles */}
        <motion.div
          className="absolute top-6 right-10 w-32 h-32 rounded-full opacity-[0.04]"
          style={{ background: config.gradient }}
          animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-4 right-32 w-16 h-16 rounded-full opacity-[0.06]"
          style={{ backgroundColor: BRAND_COLORS[2] }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-12 right-48 w-8 h-8 rounded-full opacity-[0.08]"
          style={{ backgroundColor: BRAND_COLORS[0] }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.06}
            duration={4}
            className="w-full h-full fill-black/5 stroke-black/5"
          />
        </div>

        <div className="relative space-y-3">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: config.gradient }}
            >
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground/35">
                Pre-Training Curriculum
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
                <span style={{ color: config.color }}>{config.label}</span> Level
              </h1>
            </div>
            <BrandCircles className="ml-auto hidden sm:flex" />
          </motion.div>

          <motion.div
            className="h-px w-full max-w-xs"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ background: config.gradient, transformOrigin: 'left' }}
          />

          <motion.p
            className="text-foreground/45 text-sm max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {videos.length} lessons to complete before your in-person training begins.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {videosLoading ? (
          <div className="text-center py-16 text-foreground/40">Loading videos…</div>
        ) : videos.length === 0 ? (
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-16 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-5">
              <Lock className="h-7 w-7 text-foreground/25" />
            </div>
            <p className="text-xl text-foreground/60 font-semibold">Course content coming soon</p>
            <p className="text-sm text-foreground/35 mt-2 max-w-sm mx-auto">
              Your training videos will be available here before your in-person training begins.
            </p>
            <BrandCircles className="justify-center mt-6" />
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Video Player */}
            {activeVideo && (
              <motion.div
                className="rounded-2xl overflow-hidden border border-foreground/[0.06] shadow-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVideo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://player.vimeo.com/video/${activeVideo.vimeo_id}?h=0&title=0&byline=0&portrait=0`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Info bar + Next/Prev navigation */}
                    <div className="bg-background/80 backdrop-blur-sm px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold text-white shrink-0"
                              style={{ background: config.gradient }}
                            >
                              {activeIndex + 1}
                            </span>
                            <h3 className="text-lg font-bold tracking-tight text-foreground/85 truncate">
                              {activeVideo.title}
                            </h3>
                          </div>
                          {activeVideo.description && (
                            <p className="text-sm text-foreground/45 leading-relaxed max-w-2xl pl-10">
                              {activeVideo.description}
                            </p>
                          )}
                        </div>
                        {(activeVideo as any).pdf_path && (
                          <a
                            href={supabase.storage.from('course-pdfs').getPublicUrl((activeVideo as any).pdf_path).data.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border border-foreground/10 hover:border-foreground/20 text-foreground/60 hover:text-foreground/80"
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </a>
                        )}
                      </div>

                      {/* Previous / Next navigation */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-foreground/[0.06]">
                        <button
                          onClick={() => canGoPrev && goTo(activeIndex - 1)}
                          disabled={!canGoPrev}
                          className={cn(
                            'flex items-center gap-2 text-sm font-medium transition-all rounded-xl px-4 py-2.5',
                            canGoPrev
                              ? 'text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04]'
                              : 'text-foreground/20 cursor-not-allowed'
                          )}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline truncate max-w-[180px]">
                            {canGoPrev ? videos[activeIndex - 1].title : 'Previous'}
                          </span>
                          <span className="sm:hidden">Prev</span>
                        </button>

                        {/* Progress circles */}
                        <div className="flex items-center gap-1.5">
                          {videos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => goTo(i)}
                              className={cn(
                                'rounded-full transition-all duration-300',
                                i === activeIndex
                                  ? 'w-3 h-3 shadow-lg'
                                  : 'w-2 h-2 bg-foreground/10 hover:bg-foreground/20'
                              )}
                              style={
                                i === activeIndex
                                  ? { background: config.gradient, boxShadow: `0 2px 8px ${config.color}40` }
                                  : undefined
                              }
                              aria-label={`Go to lesson ${i + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() => canGoNext && goTo(activeIndex + 1)}
                          disabled={!canGoNext}
                          className={cn(
                            'flex items-center gap-2 text-sm font-medium transition-all rounded-xl px-4 py-2.5',
                            canGoNext
                              ? 'text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04]'
                              : 'text-foreground/20 cursor-not-allowed'
                          )}
                        >
                          <span className="hidden sm:inline truncate max-w-[180px]">
                            {canGoNext ? videos[activeIndex + 1].title : 'Next'}
                          </span>
                          <span className="sm:hidden">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* Lesson List */}
            <motion.div
              className="relative rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              {/* Decorative circle in corner */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.03]"
                style={{ background: config.gradient }}
              />

              <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">
                    All Lessons
                  </h3>
                  <BrandCircles />
                </div>
                <span className="text-xs text-foreground/30">{videos.length} total</span>
              </div>

              <div className="divide-y divide-foreground/[0.04]">
                {videos.map((video, i) => {
                  const isActive = activeVideo?.id === video.id;
                  // Cycle brand colors for the left accent
                  const accentColor = BRAND_COLORS[i % 3];
                  return (
                    <motion.button
                      key={video.id}
                      onClick={() => setActiveVideoId(video.id)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        'w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-200 group relative',
                        isActive
                          ? 'bg-foreground/[0.04]'
                          : 'hover:bg-foreground/[0.02]'
                      )}
                    >
                      {/* Left accent bar */}
                      <div
                        className={cn(
                          'absolute left-0 top-2 bottom-2 w-[3px] rounded-full transition-opacity duration-300',
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
                        )}
                        style={{ backgroundColor: accentColor }}
                      />

                      {/* Number circle */}
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                          isActive ? 'text-white shadow-lg' : 'bg-foreground/[0.06] text-foreground/40 group-hover:bg-foreground/[0.1]',
                        )}
                        style={isActive ? { background: config.gradient, boxShadow: `0 4px 14px ${config.color}30` } : undefined}
                      >
                        {isActive ? <Play className="h-4 w-4" /> : i + 1}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          'text-sm font-semibold truncate transition-colors',
                          isActive ? 'text-foreground/90' : 'text-foreground/60 group-hover:text-foreground/75'
                        )}>
                          {video.title}
                        </p>
                        {video.description && (
                          <p className="text-xs text-foreground/35 truncate mt-0.5">
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* PDF indicator + Arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        {(video as any).pdf_path && (
                          <FileText className="h-4 w-4 text-foreground/25" />
                        )}
                        <ChevronRight
                          className={cn(
                            'h-4 w-4 transition-all',
                            isActive ? 'text-foreground/50' : 'text-foreground/15 group-hover:text-foreground/30',
                          )}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
