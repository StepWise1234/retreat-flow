import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, FileText, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  vimeo_id: string;
  pdf_path?: string | null;
}

interface CourseVideoSectionProps {
  videos: VideoItem[];
  videosLoading: boolean;
  config: { label: string; color: string; gradient: string };
}

export default function CourseVideoSection({ videos, videosLoading, config }: CourseVideoSectionProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeVideo = videos.find((v) => v.id === activeVideoId) ?? videos[0] ?? null;
  const activeIndex = activeVideo ? videos.findIndex((v) => v.id === activeVideo.id) : 0;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < videos.length - 1;

  const goToPrev = () => { if (hasPrev) setActiveVideoId(videos[activeIndex - 1].id); };
  const goToNext = () => { if (hasNext) setActiveVideoId(videos[activeIndex + 1].id); };

  if (videosLoading) {
    return <div className="text-center py-16 text-foreground/40">Loading videos…</div>;
  }

  if (videos.length === 0) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-16 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-5">
          <Lock className="h-7 w-7 text-foreground/25" />
        </div>
        <p className="text-xl text-foreground/60 font-semibold">Course content coming soon</p>
        <p className="text-sm text-foreground/35 mt-2 max-w-sm mx-auto">
          Your training videos will be available here before your in-person training begins.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {activeVideo && (
        <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] shadow-lg">
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
              <div className="bg-background/80 backdrop-blur-sm px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-xs font-bold text-white shrink-0"
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

                {/* Prev / Next */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/[0.06]">
                  <button
                    onClick={goToPrev}
                    disabled={!hasPrev}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-all rounded-lg px-3 py-2',
                      hasPrev
                        ? 'text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04]'
                        : 'text-foreground/20 cursor-not-allowed'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline truncate max-w-[160px]">
                      {hasPrev ? videos[activeIndex - 1].title : 'Previous'}
                    </span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  <span className="text-xs text-foreground/30 tabular-nums shrink-0">
                    {activeIndex + 1} / {videos.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={!hasNext}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-all rounded-lg px-3 py-2',
                      hasNext
                        ? 'text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04]'
                        : 'text-foreground/20 cursor-not-allowed'
                    )}
                  >
                    <span className="hidden sm:inline truncate max-w-[160px]">
                      {hasNext ? videos[activeIndex + 1].title : 'Next'}
                    </span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Lesson List */}
      <div className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-foreground/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider">All Lessons</h3>
          <span className="text-xs text-foreground/30">{videos.length} total</span>
        </div>
        <div className="divide-y divide-foreground/[0.04]">
          {videos.map((video, i) => {
            const isActive = activeVideo?.id === video.id;
            return (
              <motion.button
                key={video.id}
                onClick={() => setActiveVideoId(video.id)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-4 text-left transition-all duration-200 group',
                  isActive ? 'bg-foreground/[0.04]' : 'hover:bg-foreground/[0.02]'
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300',
                    isActive ? 'text-white shadow-lg' : 'bg-foreground/[0.06] text-foreground/40 group-hover:bg-foreground/[0.1]'
                  )}
                  style={isActive ? { background: config.gradient, boxShadow: `0 4px 14px ${config.color}30` } : undefined}
                >
                  {isActive ? <Play className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-sm font-semibold truncate transition-colors',
                    isActive ? 'text-foreground/90' : 'text-foreground/60 group-hover:text-foreground/75'
                  )}>
                    {video.title}
                  </p>
                  {video.description && (
                    <p className="text-xs text-foreground/35 truncate mt-0.5">{video.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(video as any).pdf_path && <FileText className="h-4 w-4 text-foreground/25" />}
                  <ChevronRight className={cn(
                    'h-4 w-4 transition-all',
                    isActive ? 'text-foreground/50' : 'text-foreground/15 group-hover:text-foreground/30'
                  )} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
