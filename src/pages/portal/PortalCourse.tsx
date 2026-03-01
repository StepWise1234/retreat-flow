import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Play, Lock, ChevronRight, ChevronLeft, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import {
  useCourses,
  useCourseWithContent,
  getCourseGradient,
  type CourseLesson,
} from '@/hooks/useCourseData';
import ModuleCard from '@/components/portal/ModuleCard';
import CourseDiscussion from '@/components/portal/CourseDiscussion';

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
    color: '#8B5CF6',  // Purple
    gradient: '#8B5CF6',  // Solid purple
    subtitle: 'Full-Release Mastery',
  },
};

export default function PortalCourse() {
  const { data: courses = [], isLoading: coursesLoading } = useCourses();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

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

  // Auto-select first lesson when course content loads
  useEffect(() => {
    if (courseContent?.modules && courseContent.modules.length > 0 && !activeLesson) {
      const firstLesson = courseContent.modules[0]?.lessons?.[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [courseContent, activeLesson]);

  // Reset lesson when course changes
  useEffect(() => {
    setActiveLesson(null);
  }, [activeCourse?.id]);

  // Mark lesson as completed (demo - would persist to backend)
  const markCompleted = (lessonId: string) => {
    setCompletedLessons((prev) => new Set([...prev, lessonId]));
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
      {/* Hero with course selector */}
      <div className="relative overflow-hidden px-6 sm:px-8 lg:px-10 pt-10 pb-8">
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
              {/* Course circles - active first */}
              <div className="flex items-center gap-2.5">
                {courses
                  .slice()
                  .sort((a, b) => {
                    if (a.id === activeCourse?.id) return -1;
                    if (b.id === activeCourse?.id) return 1;
                    return a.sort_order - b.sort_order;
                  })
                  .map((course) => {
                    const isActive = course.id === activeCourse?.id;
                    const style = courseColorMap[course.slug] || {
                      color: course.color || '#FFA500',
                    };
                    return (
                      <motion.button
                        key={course.id}
                        layoutId={`circle-${course.id}`}
                        onClick={() => {
                          setActiveCourseId(course.id);
                          setActiveLesson(null);
                        }}
                        className="shrink-0 rounded-full border-none outline-none cursor-pointer relative"
                        style={{
                          backgroundColor: style.color,
                          boxShadow: isActive
                            ? `0 0 18px 4px ${style.color}35, 0 0 6px 1px ${style.color}20`
                            : 'none',
                        }}
                        animate={{
                          width: isActive ? 44 : 28,
                          height: isActive ? 44 : 28,
                        }}
                        whileHover={{ scale: isActive ? 1 : 1.15 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        title={course.name}
                      />
                    );
                  })}
              </div>

              {/* Active course title */}
              <AnimatePresence mode="wait">
                {activeCourse && (
                  <motion.div
                    key={activeCourse.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-foreground/35">
                      {courseStyle.subtitle}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
                      <span style={{ color: courseStyle.color }}>{activeCourse.name}</span> Course
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>

          {/* Overall Progress Bar */}
          <div className="mt-6 max-w-lg">
            <div className="flex items-center justify-between text-xs text-foreground/50 mb-2">
              <span className="font-medium">Course Progress</span>
              <span className="tabular-nums">
                {completedCount} of {allLessons.length} lessons completed
              </span>
            </div>
            <div className="h-2 rounded-full bg-foreground/[0.08] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: courseStyle.gradient }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
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
              {/* Video Player & Lesson Carousel */}
              <VideoPlayerWithCarousel
                activeLesson={activeLesson}
                allLessons={allLessons}
                currentLessonIndex={currentLessonIndex}
                courseStyle={courseStyle}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={goToPrev}
                onNext={goToNext}
                onSelectLesson={setActiveLesson}
                completedLessons={completedLessons}
                onMarkComplete={markCompleted}
              />

              {/* Modules */}
              <div className="space-y-4">
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
              <CourseDiscussion
                lessonId={activeLesson?.id || null}
                lessonTitle={activeLesson?.title || ''}
                courseColor={courseStyle.color}
                courseGradient={courseStyle.gradient}
              />
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
  courseStyle: { color: string; gradient: string };
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelectLesson: (lesson: CourseLesson) => void;
  completedLessons: Set<string>;
  onMarkComplete: (lessonId: string) => void;
}

function VideoPlayerWithCarousel({
  activeLesson,
  allLessons,
  currentLessonIndex,
  courseStyle,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onSelectLesson,
  completedLessons,
  onMarkComplete,
}: VideoPlayerWithCarouselProps) {
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
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-all',
              hasPrev
                ? 'bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground/70'
                : 'bg-foreground/[0.03] text-foreground/20 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center min-w-[120px]">
            <p className="text-xs text-foreground/40 uppercase tracking-wider">Lesson</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: courseStyle.color }}>
              {currentLessonIndex + 1} <span className="text-foreground/30 font-normal">of</span>{' '}
              {allLessons.length}
            </p>
          </div>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full transition-all',
              hasNext
                ? 'bg-foreground/[0.06] hover:bg-foreground/[0.1] text-foreground/70'
                : 'bg-foreground/[0.03] text-foreground/20 cursor-not-allowed'
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="hidden sm:flex items-center gap-1.5">
          {allLessons.slice(0, 12).map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => onSelectLesson(lesson)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === currentLessonIndex
                  ? 'w-6'
                  : completedLessons.has(lesson.id)
                    ? 'w-1.5 opacity-60'
                    : 'w-1.5 opacity-30'
              )}
              style={{
                backgroundColor:
                  idx === currentLessonIndex || completedLessons.has(lesson.id)
                    ? courseStyle.color
                    : 'currentColor',
              }}
            />
          ))}
          {allLessons.length > 12 && (
            <span className="text-xs text-foreground/30 ml-1">+{allLessons.length - 12}</span>
          )}
        </div>
      </div>

      {/* Video Player Card */}
      <div className="rounded-2xl overflow-hidden border border-foreground/[0.06] shadow-xl bg-gradient-to-b from-background to-background/80">
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
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-foreground/[0.05] hover:bg-foreground/[0.08] text-foreground/60'
                    )}
                  >
                    {completedLessons.has(activeLesson.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4" />
                        <span className="hidden sm:inline">Mark Complete</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Lesson Card Carousel */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allLessons.map((lesson, idx) => {
            const isActive = idx === currentLessonIndex;
            const isCompleted = completedLessons.has(lesson.id);
            return (
              <motion.button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={cn(
                  'flex-shrink-0 snap-center rounded-xl border transition-all text-left',
                  'w-[200px] sm:w-[240px] p-4',
                  isActive
                    ? 'border-2 shadow-lg'
                    : 'border-foreground/[0.06] hover:border-foreground/[0.12] hover:shadow-md'
                )}
                style={{
                  borderColor: isActive ? courseStyle.color : undefined,
                  backgroundColor: isActive ? `${courseStyle.color}08` : 'transparent',
                }}
                whileHover={{ scale: isActive ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                      isCompleted
                        ? 'bg-green-500/15 text-green-600'
                        : isActive
                          ? 'text-white'
                          : 'bg-foreground/[0.06] text-foreground/50'
                    )}
                    style={{
                      background: isActive && !isCompleted ? courseStyle.gradient : undefined,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm font-medium leading-tight line-clamp-2',
                        isActive ? 'text-foreground/90' : 'text-foreground/60'
                      )}
                    >
                      {lesson.title}
                    </p>
                    {lesson.duration_minutes && (
                      <p className="text-xs text-foreground/35 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration_minutes} min
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Carousel fade edges */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
