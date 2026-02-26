import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock } from 'lucide-react';
import { useApplication } from '@/hooks/useApplication';
import { useCourseVideos } from '@/hooks/useCourseVideos';
import { cn } from '@/lib/utils';

const levelConfig: Record<string, { label: string; color: string }> = {
  beginning: { label: 'Beginning', color: '#FFA500' },
  intermediate: { label: 'Intermediate', color: '#FF4500' },
  advanced: { label: 'Advanced', color: '#800080' },
};

export default function PortalCourse() {
  const { application, isLoading: appLoading } = useApplication();
  const level = application?.training_level || 'beginning';
  const config = levelConfig[level] || levelConfig.beginning;

  const { data: videos = [], isLoading: videosLoading } = useCourseVideos(level);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeVideo = videos.find((v) => v.id === activeVideoId) ?? videos[0] ?? null;

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
          Online Course
        </h1>
        <p className="mt-1 text-foreground/45">
          Your{' '}
          <span className="font-semibold" style={{ color: config.color }}>
            {config.label}
          </span>{' '}
          level pre-training curriculum.
        </p>
      </div>

      {videosLoading ? (
        <div className="text-center py-16 text-foreground/40">Loading videos…</div>
      ) : videos.length === 0 ? (
        <motion.div
          className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mx-auto w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-foreground/30" />
          </div>
          <p className="text-lg text-foreground/60 font-medium">Course content coming soon</p>
          <p className="text-sm text-foreground/35 mt-1">
            Your training videos will be available here before your in-person training begins.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Video player */}
          <motion.div
            className="rounded-xl border border-foreground/[0.06] bg-black overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeVideo && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVideo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-video">
                    <iframe
                      src={`https://player.vimeo.com/video/${activeVideo.vimeo_id}?h=0&title=0&byline=0&portrait=0`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4 bg-background/60">
                    <h3 className="font-semibold text-foreground/80">{activeVideo.title}</h3>
                    {activeVideo.description && (
                      <p className="text-sm text-foreground/45 mt-1">{activeVideo.description}</p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>

          {/* Playlist sidebar */}
          <motion.div
            className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-4 border-b border-foreground/[0.06]">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">
                {config.label} Curriculum
              </h3>
              <p className="text-xs text-foreground/35 mt-0.5">{videos.length} videos</p>
            </div>
            <div className="divide-y divide-foreground/[0.04] max-h-[500px] overflow-y-auto scrollbar-thin">
              {videos.map((video, i) => {
                const isActive = activeVideo?.id === video.id;
                return (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideoId(video.id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-all duration-200',
                      isActive
                        ? 'bg-foreground/[0.04]'
                        : 'hover:bg-foreground/[0.02]'
                    )}
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: isActive ? config.color : 'hsl(var(--foreground) / 0.15)' }}
                    >
                      {isActive ? <Play className="h-3 w-3" /> : i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className={cn(
                        'text-sm font-medium truncate',
                        isActive ? 'text-foreground/90' : 'text-foreground/60'
                      )}>
                        {video.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
