import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseLesson } from '@/hooks/useCourseData';

interface LessonCardProps {
  lesson: CourseLesson;
  lessonIndex: number;
  courseColor: string;
  courseGradient: string;
  isActive: boolean;
  isCompleted?: boolean;
  onClick: () => void;
}

export default function LessonCard({
  lesson,
  lessonIndex,
  courseColor,
  courseGradient,
  isActive,
  isCompleted = false,
  onClick,
}: LessonCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: lessonIndex * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative w-full text-left rounded-xl overflow-hidden transition-all duration-300 group',
        'border border-foreground/[0.06] bg-background/60 backdrop-blur-sm',
        isActive && 'ring-2 ring-offset-2 ring-offset-background'
      )}
      style={{
        boxShadow: isActive
          ? `0 8px 24px ${courseColor}25, 0 2px 8px ${courseColor}15`
          : undefined,
        ringColor: isActive ? courseColor : undefined,
      }}
    >
      {/* Thumbnail placeholder with gradient overlay */}
      <div className="relative aspect-video bg-foreground/[0.03] overflow-hidden">
        {/* Gradient background as thumbnail placeholder */}
        <div
          className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-30"
          style={{ background: courseGradient }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`grid-${lesson.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-foreground/10"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${lesson.id})`} />
          </svg>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className={cn(
              'flex items-center justify-center rounded-full transition-all duration-300',
              isActive ? 'h-14 w-14' : 'h-12 w-12 group-hover:h-14 group-hover:w-14'
            )}
            style={{
              background: courseGradient,
              boxShadow: `0 4px 16px ${courseColor}40`,
            }}
            whileHover={{ scale: 1.1 }}
          >
            <Play
              className={cn(
                'text-white transition-all duration-200 ml-0.5',
                isActive ? 'h-6 w-6' : 'h-5 w-5 group-hover:h-6 group-hover:w-6'
              )}
              fill="white"
            />
          </motion.div>
        </div>

        {/* Duration badge */}
        {lesson.duration_minutes && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm">
            <Clock className="h-3 w-3 text-white/70" />
            <span className="text-xs font-medium text-white/90 tabular-nums">
              {lesson.duration_minutes} min
            </span>
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-2 right-2">
            <div
              className="flex items-center justify-center h-6 w-6 rounded-full"
              style={{ backgroundColor: courseColor }}
            >
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Lesson number */}
        <div className="absolute top-2 left-2 flex items-center justify-center h-6 w-6 rounded-md bg-black/50 backdrop-blur-sm">
          <span className="text-xs font-bold text-white/90">{lessonIndex + 1}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h4
          className={cn(
            'text-sm font-semibold truncate transition-colors',
            isActive ? 'text-foreground/90' : 'text-foreground/70 group-hover:text-foreground/85'
          )}
        >
          {lesson.title}
        </h4>
        {lesson.description && (
          <p className="text-xs text-foreground/40 truncate mt-0.5">{lesson.description}</p>
        )}
      </div>

      {/* Active indicator line */}
      {isActive && (
        <motion.div
          layoutId="lesson-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: courseGradient }}
        />
      )}
    </motion.button>
  );
}

// Horizontal scrollable lesson chooser component
interface LessonChooserProps {
  lessons: CourseLesson[];
  courseColor: string;
  courseGradient: string;
  activeLesson: CourseLesson | null;
  onSelectLesson: (lesson: CourseLesson) => void;
}

export function LessonChooser({
  lessons,
  courseColor,
  courseGradient,
  activeLesson,
  onSelectLesson,
}: LessonChooserProps) {
  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-4 pb-2">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="w-56 shrink-0">
              <LessonCard
                lesson={lesson}
                lessonIndex={index}
                courseColor={courseColor}
                courseGradient={courseGradient}
                isActive={activeLesson?.id === lesson.id}
                onClick={() => onSelectLesson(lesson)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
