import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Lock, ChevronRight, ChevronLeft, CheckCircle2, Circle, Clock, FileText, Video } from 'lucide-react';

// StepWise brand purple for carousel
const STEPWISE_PURPLE = '#9D067A';
import { cn } from '@/lib/utils';
import {
  useCourses,
  useCourseWithContent,
  useLessonProgress,
  useTrackLessonView,
  useMarkLessonComplete,
  useVimeoThumbnail,
  getCourseGradient,
  type CourseLesson,
  type CourseResource,
} from '@/hooks/useCourseData';
import ModuleCard from '@/components/portal/ModuleCard';
import CourseDiscussion from '@/components/portal/CourseDiscussion';
import ResourceViewer from '@/components/portal/ResourceViewer';

// Course color mapping - using StepWise brand colors
// Yellow: Beginning, Red: Intermediate, Purple: Advanced
const courseColorMap: Record<string, { color: string; gradient: string; subtitle: string }> = {
  beginning: {
    color: '#F5A623',  // StepWise yellow
    gradient: '#F5A623',  // Solid yellow (no gradient)
    subtitle: 'Foundation Training',
  },
  'intermediate-touch': {
    color: '#E53935',  // StepWise red
    gradient: '#E53935',  // Solid red
    subtitle: 'Touch & Parts-Work',
  },
  'intermediate-nsr': {
    color: '#E53935',  // StepWise red
    gradient: '#E53935',  // Solid red
    subtitle: 'Nervous System Regulation',
  },
  'intermediate-ri': {
    color: '#E53935',  // StepWise red
    gradient: '#E53935',  // Solid red
    subtitle: 'Relational Intelligence',
  },
  advanced: {
    color: '#9D067A',  // Purple
    gradient: '#9D067A',  // Solid purple
    subtitle: 'Full-Release Mastery',
  },
};

export default function PortalCourse() {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [hasRestoredLesson, setHasRestoredLesson] = useState(false);

  // Set default course when courses load
  const activeCourse = useMemo(() => {
    if (activeCourseId) return courses.find((c) => c.id === activeCourseId);
    if (courses.length > 0) {
      const first = courses[0];
      if (!activeCourseId) setActiveCourseId(first.id);
      return first;
    }
    return null;
  }, [courses, activeCourseId]);

  const { data: courseContent, isLoading: contentLoading } = useCourseWithContent(
    activeCourse?.id || null
  );

  // Fetch lesson progress from database
  const { data: progressData } = useLessonProgress(activeCourse?.id || null);
  const completedLessons = progressData?.completedLessons || new Set<string>();
  const lastViewedLessonId = progressData?.lastViewedLessonId;

  // Mutations for tracking progress
  const trackLessonView = useTrackLessonView();
  const markLessonComplete = useMarkLessonComplete();

  // Get styling for active course
  const courseStyle = activeCourse
    ? courseColorMap[activeCourse.slug] || {
        color: activeCourse.color || '#FFA500',
        gradient: getCourseGradient(activeCourse.color),
        subtitle: activeCourse.description || 'Course Curriculum',
      }
    : courseColorMap.beginning;

  // Find all lessons across modules for navigation
  const allLessons = useMemo(() => {
    if (!courseContent?.modules) return [];
    return courseContent.modules.flatMap((m) => m.lessons || []);
  }, [courseContent]);

  // Get resources for the active lesson (lesson-specific + module-level for current lesson's module)
  const lessonResources = useMemo(() => {
    if (!activeLesson || !courseContent?.modules) return [];
    const module = courseContent.modules.find(m =>
      m.lessons?.some(l => l.id === activeLesson.id)
    );
    if (!module) return [];

    // Get lesson-specific resources + module-level resources (where lesson_id is null)
    return (module.resources || []).filter(r =>
      r.lesson_id === activeLesson.id || r.lesson_id === null
    );
  }, [activeLesson, courseContent]);

  const currentLessonIndex = activeLesson
    ? allLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;

  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

  const goToPrev = () => {
    if (hasPrev) setActiveLesson(allLessons[currentLessonIndex - 1]);
  };
  const goToNext = () => {
    if (hasNext) setActiveLesson(allLessons[currentLessonIndex + 1]);
  };

  // Restore last viewed lesson or select first lesson when course content loads
  useEffect(() => {
    if (courseContent?.modules && courseContent.modules.length > 0 && !activeLesson && !hasRestoredLesson) {
      // Try to restore last viewed lesson
      if (lastViewedLessonId) {
        const lastLesson = allLessons.find(l => l.id === lastViewedLessonId);
        if (lastLesson) {
          setActiveLesson(lastLesson);
          setHasRestoredLesson(true);
          return;
        }
      }
      // Fall back to first lesson
      const firstLesson = courseContent.modules[0]?.lessons?.[0];
      if (firstLesson) {
        setActiveLesson(firstLesson);
        setHasRestoredLesson(true);
      }
    }
  }, [courseContent, activeLesson, lastViewedLessonId, allLessons, hasRestoredLesson]);

  // Reset lesson and restore flag when course changes
  useEffect(() => {
    setActiveLesson(null);
    setHasRestoredLesson(false);
  }, [activeCourse?.id]);

  // Track lesson view when active lesson changes
  useEffect(() => {
    if (activeLesson && activeCourse?.id) {
      trackLessonView.mutate({ courseId: activeCourse.id, lessonId: activeLesson.id });
    }
  }, [activeLesson?.id, activeCourse?.id]);

  // Mark lesson as completed - persists to database
  const markCompleted = (lessonId: string) => {
    if (activeCourse?.id) {
      markLessonComplete.mutate({ courseId: activeCourse.id, lessonId });
    }
  };

  if (coursesLoading) {
    return (
      <div className="text-center py-20">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground/50 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Lock className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
        <p className="text-xl text-foreground/60">No courses available</p>
        <p className="text-foreground/40">Your courses will appear here once you have access.</p>
      </div>
    );
  }

  const completedCount = allLessons.filter((l) => completedLessons.has(l.id)).length;
  const progressPercent = allLessons.length > 0 ? (completedCount / allLessons.length) * 100 : 0;

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      {/* Main content */}
      <div className="pb-8 space-y-6 pt-6">
        <AnimatePresence mode="wait">
          {contentLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground/50 rounded-full animate-spin mx-auto" />
            </motion.div>
          ) : courseContent?.modules && courseContent.modules.length > 0 ? (
            <motion.div
              key={activeCourse?.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Video Player */}
              <VideoPlayerWithCarousel
                activeLesson={activeLesson}
                allLessons={allLessons}
                currentLessonIndex={currentLessonIndex}
                courseStyle={courseStyle}
                courseName={activeCourse?.name || 'Course'}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={goToPrev}
                onNext={goToNext}
                onSelectLesson={setActiveLesson}
                completedLessons={completedLessons}
                onMarkComplete={markCompleted}
                lessonResources={lessonResources}
              />

              {/* Modules */}
              <div className="space-y-4 px-4 sm:px-6 lg:px-8">
                <h2 className="text-sm font-semibold text-foreground/50 uppercase tracking-wider px-1">
                  Course Modules
                </h2>
                {courseContent.modules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    moduleIndex={index}
                    courseColor={courseStyle.color}
                    courseGradient={courseStyle.gradient}
                    activeLesson={activeLesson}
                    onSelectLesson={setActiveLesson}
                    defaultExpanded={index === 0}
                  />
                ))}
              </div>

              {/* Discussion section */}
              <div className="px-4 sm:px-6 lg:px-8">
              <CourseDiscussion
                lessonId={activeLesson?.id || null}
                lessonTitle={activeLesson?.title || ''}
                courseColor={courseStyle.color}
                courseGradient={courseStyle.gradient}
              />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative overflow-hidden rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-16 text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center mb-5">
                <Lock className="h-7 w-7 text-foreground/25" />
              </div>
              <p className="text-xl text-foreground/60 font-semibold">Course content coming soon</p>
              <p className="text-sm text-foreground/35 mt-2 max-w-sm mx-auto">
                Your training videos will be available here before your in-person training begins.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Video Player with Lesson Carousel Component
interface VideoPlayerWithCarouselProps {
  activeLesson: CourseLesson | null;
  allLessons: CourseLesson[];
  currentLessonIndex: number;
  courseStyle: { color: string; gradient: string; subtitle?: string };
  courseName: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectLesson: (lesson: CourseLesson) => void;
  completedLessons: Set<string>;
  onMarkComplete: (lessonId: string) => void;
  lessonResources: CourseResource[];
}

function VideoPlayerWithCarousel({
  activeLesson,
  allLessons,
  currentLessonIndex,
  courseStyle,
  courseName,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onSelectLesson,
  completedLessons,
  onMarkComplete,
  lessonResources,
}: VideoPlayerWithCarouselProps) {
  const hasResources = lessonResources.length > 0;
  const [mobileView, setMobileView] = useState<'video' | 'pdf'>('video');

  return (
    <div className="space-y-4">
      {/* Compact Header: Course Title + Lesson Nav */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Course color circle */}
          <div
            className="w-10 h-10 rounded-full shrink-0"
            style={{
              backgroundColor: courseStyle.color,
              boxShadow: `0 0 12px 2px ${courseStyle.color}30`,
            }}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-foreground/40">
              {courseStyle.subtitle || 'Course'}
            </p>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground/85">
              <span style={{ color: courseStyle.color }}>{courseName}</span>
            </h1>
          </div>
        </div>

        {/* Simple lesson navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-all',
              hasPrev
                ? 'bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground/70'
                : 'bg-foreground/[0.03] text-foreground/20 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            {allLessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={cn(
                  'rounded-full transition-all',
                  idx === currentLessonIndex
                    ? 'w-5 h-2'
                    : completedLessons.has(lesson.id)
                      ? 'w-2 h-2 opacity-70'
                      : 'w-2 h-2 opacity-30'
                )}
                style={{
                  backgroundColor:
                    idx === currentLessonIndex || completedLessons.has(lesson.id)
                      ? courseStyle.color
                      : 'currentColor',
                }}
                title={lesson.title}
              />
            ))}
          </div>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-all',
              hasNext
                ? 'bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground/70'
                : 'bg-foreground/[0.03] text-foreground/20 cursor-not-allowed'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile View Toggle - only show when resources exist */}
      {hasResources && (
        <div className="flex lg:hidden px-4 sm:px-6">
          <div className="inline-flex rounded-lg border border-foreground/[0.08] p-1 bg-foreground/[0.02]">
            <button
              onClick={() => setMobileView('video')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                mobileView === 'video'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-foreground/50 hover:text-foreground/70'
              )}
            >
              <Video className="h-4 w-4" />
              Video
            </button>
            <button
              onClick={() => setMobileView('pdf')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                mobileView === 'pdf'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-foreground/50 hover:text-foreground/70'
              )}
            >
              <FileText className="h-4 w-4" />
              Handout
            </button>
          </div>
        </div>
      )}

      {/* Video Player Card with optional Resource Panel - 20% wider than rest of content */}
      <div className="-mx-2 sm:-mx-4 lg:-mx-6">
        <motion.div
          layout
          className={cn(
            'grid gap-4 transition-all duration-500 px-2 sm:px-4 lg:px-6',
            hasResources ? 'lg:grid-cols-[2fr_1fr]' : 'grid-cols-1'
          )}
        >
        {/* Video Section */}
        <motion.div
          layout
          className={cn(
            'rounded-2xl overflow-hidden border border-foreground/[0.06] shadow-xl bg-gradient-to-b from-background to-background/80',
            hasResources && mobileView === 'pdf' ? 'hidden lg:block' : ''
          )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLesson?.id || 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Video embed or placeholder */}
              <div className="aspect-video bg-gradient-to-br from-foreground/[0.03] to-foreground/[0.06] relative">
                {activeLesson?.vimeo_id ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${activeLesson.vimeo_id}?h=0&title=0&byline=0&portrait=0`}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                      style={{ background: `${courseStyle.color}15` }}
                    >
                      <Play
                        className="h-8 w-8 ml-1"
                        style={{ color: courseStyle.color }}
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-foreground/60 font-medium text-lg">
                      {activeLesson?.title || 'Select a lesson'}
                    </p>
                    <p className="text-foreground/35 text-sm mt-1">Video coming soon</p>
                  </div>
                )}
              </div>

              {/* Video info bar */}
              <div className="bg-background/90 backdrop-blur-sm px-6 py-4 border-t border-foreground/[0.04]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span
                      className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-sm font-bold text-white shrink-0"
                      style={{ background: courseStyle.gradient }}
                    >
                      {currentLessonIndex + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold tracking-tight text-foreground/90 truncate">
                        {activeLesson?.title || 'No lesson selected'}
                      </h3>
                      {activeLesson?.duration_minutes && (
                        <p className="text-xs text-foreground/40 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {activeLesson.duration_minutes} min
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mark complete button */}
                  {activeLesson && (
                    <button
                      onClick={() => onMarkComplete(activeLesson.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        completedLessons.has(activeLesson.id)
                          ? 'bg-green-500 text-white'
                          : 'text-white hover:opacity-90'
                      )}
                      style={!completedLessons.has(activeLesson.id) ? { backgroundColor: STEPWISE_PURPLE } : undefined}
                    >
                      {completedLessons.has(activeLesson.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4 text-white" />
                          <span className="hidden sm:inline">Mark Complete</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Resource Panel - shown on desktop always, on mobile when PDF tab selected */}
        <AnimatePresence>
          {hasResources && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={cn(
                'h-full min-h-[400px]',
                mobileView === 'pdf' ? 'block' : 'hidden lg:block'
              )}
            >
              <ResourceViewer
                resources={lessonResources}
                courseColor={courseStyle.color}
                className="h-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>
      </div>

      {/* Lesson Carousel - purple background */}
      <LessonCarousel
        allLessons={allLessons}
        currentLessonIndex={currentLessonIndex}
        completedLessons={completedLessons}
        onSelectLesson={onSelectLesson}
        courseColor={courseStyle.color}
      />
    </div>
  );
}

// StepWise brand colors for alternating glow
const STEPWISE_COLORS = ['#F5A623', '#E53935', '#9D067A']; // Yellow, Red, Purple

// Individual Lesson Card with Vimeo Thumbnail
interface LessonCardProps {
  lesson: CourseLesson;
  idx: number;
  isActive: boolean;
  isCompleted: boolean;
  glowColor: string;
  onSelect: () => void;
}

function LessonCard({ lesson, idx, isActive, isCompleted, glowColor, onSelect }: LessonCardProps) {
  const { data: thumbnailUrl } = useVimeoThumbnail(lesson.vimeo_id);

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        'flex-shrink-0 snap-center rounded-xl border text-left overflow-hidden',
        'w-40 sm:w-56', // Smaller on mobile
        'transition-all duration-300',
        'border-foreground/[0.06] bg-card'
      )}
      style={{
        boxShadow: isActive
          ? `0 0 40px ${glowColor}60, 0 0 80px ${glowColor}35, 0 8px 30px ${glowColor}30`
          : `0 0 20px ${glowColor}25, 0 4px 12px ${glowColor}15`,
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-foreground/[0.03] overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${glowColor}10, ${glowColor}18)`
            }}
          />
        )}

        {/* Lesson number badge */}
        <div
          className="absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
          style={{
            backgroundColor: isCompleted ? '#22c55e' : glowColor
          }}
        >
          {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
        </div>

        {/* Duration badge */}
        {lesson.duration_minutes && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-white/90 tabular-nums">
              {lesson.duration_minutes} min
            </span>
          </div>
        )}

        {/* Play indicator for active */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: glowColor,
                boxShadow: `0 4px 20px ${glowColor}60`
              }}
            >
              <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2.5">
        <p
          className={cn(
            'text-sm font-semibold leading-tight line-clamp-2',
            isActive ? 'text-foreground/90' : 'text-foreground/70'
          )}
        >
          {lesson.title}
        </p>
      </div>
    </motion.button>
  );
}

// Minimal Lesson Carousel Component
interface LessonCarouselProps {
  allLessons: CourseLesson[];
  currentLessonIndex: number;
  completedLessons: Set<string>;
  onSelectLesson: (lesson: CourseLesson) => void;
  courseColor: string;
}

function LessonCarousel({
  allLessons,
  currentLessonIndex,
  completedLessons,
  onSelectLesson,
  courseColor,
}: LessonCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Scroll to active card
  useEffect(() => {
    if (carouselRef.current && currentLessonIndex >= 0) {
      const card = carouselRef.current.children[currentLessonIndex] as HTMLElement;
      if (card) {
        const containerWidth = carouselRef.current.offsetWidth;
        const cardLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const scrollLeft = cardLeft - containerWidth / 2 + cardWidth / 2;
        carouselRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [currentLessonIndex]);

  return (
    <div className="relative -mx-2 sm:-mx-4 lg:-mx-6 mt-4 py-4">
      {/* Section label */}
      <div className="px-4 sm:px-6 lg:px-8 mb-3">
        <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
          All Lessons
        </p>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allLessons.map((lesson, idx) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            idx={idx}
            isActive={idx === currentLessonIndex}
            isCompleted={completedLessons.has(lesson.id)}
            glowColor={STEPWISE_COLORS[idx % 3]}
            onSelect={() => onSelectLesson(lesson)}
          />
        ))}
      </div>

      {/* Subtle fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-background to-transparent" />
      <div className="absolute inset-y-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
