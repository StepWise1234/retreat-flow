import { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useApplication } from '@/hooks/useApplication';
import { useCourseVideos } from '@/hooks/useCourseVideos';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import CourseVideoSection from '@/components/portal/CourseVideoSection';
import CoursePlaceholder, { BeginningTrainingCards } from '@/components/portal/CoursePlaceholder';

const levels = ['beginning', 'intermediate', 'advanced'] as const;
type Level = (typeof levels)[number];

const levelMeta: Record<Level, { label: string; color: string; gradient: string }> = {
  beginning: { label: 'Beginning', color: '#FFA500', gradient: 'linear-gradient(135deg, #FFA500, #FF4500)' },
  intermediate: { label: 'Intermediate', color: '#FF4500', gradient: 'linear-gradient(135deg, #FF4500, #800080)' },
  advanced: { label: 'Advanced', color: '#800080', gradient: 'linear-gradient(135deg, #800080, #FF4500)' },
};

const subtitles: Record<Level, string> = {
  beginning: 'Pre-Training Curriculum',
  intermediate: 'Specialty Workshops',
  advanced: 'Full-Release Mastery',
};

export default function PortalCourse() {
  const { application, isLoading: appLoading } = useApplication();
  const enrolledLevel = (application?.training_level || 'beginning') as Level;

  const [activeLevel, setActiveLevel] = useState<Level>(enrolledLevel);
  const meta = levelMeta[activeLevel];

  const { data: videos = [], isLoading: videosLoading } = useCourseVideos(enrolledLevel);

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
      {/* Hero with integrated level switcher */}
      <div className="relative overflow-hidden px-6 sm:px-8 lg:px-10 pt-10 pb-10">
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]">
          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.06}
            duration={4}
            className="w-full h-full fill-black/5 stroke-black/5"
          />
        </div>

        <div className="relative">
          <LayoutGroup>
            <div className="flex items-center gap-4">
              {/* Level circles — active one is first via sorted order */}
              <div className="flex items-center gap-2.5">
                {levels
                  .slice()
                  .sort((a, b) => {
                    // Active level first, then the rest in original order
                    if (a === activeLevel) return -1;
                    if (b === activeLevel) return 1;
                    return levels.indexOf(a) - levels.indexOf(b);
                  })
                  .map((lvl) => {
                    const isActive = lvl === activeLevel;
                    const m = levelMeta[lvl];
                    return (
                      <motion.button
                        key={lvl}
                        layoutId={`circle-${lvl}`}
                        onClick={() => setActiveLevel(lvl)}
                        className="shrink-0 rounded-full border-none outline-none cursor-pointer relative"
                        style={{
                          backgroundColor: m.color,
                          boxShadow: isActive ? `0 0 18px 4px ${m.color}35, 0 0 6px 1px ${m.color}20` : 'none',
                        }}
                        animate={{
                          width: isActive ? 44 : 28,
                          height: isActive ? 44 : 28,
                        }}
                        whileHover={{ scale: isActive ? 1 : 1.15 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        title={m.label}
                      />
                    );
                  })}
              </div>

              {/* Active level title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeLevel}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground/35">
                    {subtitles[activeLevel]}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
                    <span style={{ color: meta.color }}>{meta.label}</span> Level
                  </h1>
                </motion.div>
              </AnimatePresence>
            </div>
          </LayoutGroup>

          <motion.div
            className="h-px w-full max-w-xs mt-4"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ background: meta.gradient, transformOrigin: 'left' }}
            key={`line-${activeLevel}`}
          />

          <AnimatePresence mode="wait">
            <motion.p
              key={`desc-${activeLevel}`}
              className="text-foreground/45 text-sm max-w-md mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeLevel === 'beginning'
                ? `${videos.length} lessons to complete before your in-person training begins.`
                : activeLevel === 'intermediate'
                ? 'Specialty workshop curriculum — available before your in-person weekend.'
                : 'Advanced protocols and full-release session preparation.'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Content area */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <AnimatePresence mode="wait">
          {activeLevel === 'beginning' ? (
            <motion.div
              key="beginning"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <CourseVideoSection
                videos={videos}
                videosLoading={videosLoading}
                config={levelMeta.beginning}
              />
              <BeginningTrainingCards />
            </motion.div>
          ) : (
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <CoursePlaceholder level={activeLevel} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
