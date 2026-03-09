import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, FileText, Clock, CheckCircle2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { CourseModule, CourseLesson, CourseResource } from '@/hooks/useCourseData';

interface ModuleCardProps {
  module: CourseModule & {
    lessons: CourseLesson[];
    resources: CourseResource[];
  };
  moduleIndex: number;
  courseColor: string;
  courseGradient: string;
  activeLesson: CourseLesson | null;
  onSelectLesson: (lesson: CourseLesson) => void;
  defaultExpanded?: boolean;
}

export default function ModuleCard({
  module,
  moduleIndex,
  courseColor,
  courseGradient,
  activeLesson,
  onSelectLesson,
  defaultExpanded = false,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Authenticated download handler
  const handleDownload = useCallback(async (resource: CourseResource) => {
    setDownloadingId(resource.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        alert('Please log in to download resources');
        return;
      }

      const resourcePath = resource.file_path.startsWith('/')
        ? resource.file_path.slice(1)
        : resource.file_path;

      const response = await fetch(
        `https://app.stepwise.education/resources/${resourcePath}`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.title + '.' + (resource.resource_type || 'pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to download resource');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download resource');
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const totalLessons = module.lessons.length;
  const totalDuration = module.lessons.reduce(
    (sum, l) => sum + (l.duration_minutes || 0),
    0
  );

  // Check if any lesson in this module is active
  const hasActiveLesson = module.lessons.some((l) => l.id === activeLesson?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: moduleIndex * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
      style={{
        boxShadow: hasActiveLesson ? `0 0 0 1px ${courseColor}30, 0 4px 20px ${courseColor}10` : undefined,
      }}
    >
      {/* Module Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left transition-all duration-200 hover:bg-foreground/[0.02] group"
      >
        {/* Module number badge */}
        <span
          className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl text-sm font-bold text-white shadow-lg"
          style={{ background: courseGradient }}
        >
          {moduleIndex + 1}
        </span>

        {/* Title and meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold tracking-tight text-foreground/85 truncate">
            {module.title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-foreground/40">
              <Play className="h-3 w-3" />
              {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
            </span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground/40">
                <Clock className="h-3 w-3" />
                {totalDuration} min
              </span>
            )}
            {module.resources.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground/40">
                <FileText className="h-3 w-3" />
                {module.resources.length} resource{module.resources.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Expand/collapse indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Module description */}
            {module.description && (
              <div className="px-5 pb-4">
                <p className="text-sm text-foreground/45 leading-relaxed pl-14">
                  {module.description}
                </p>
              </div>
            )}

            {/* Lessons list */}
            <div className="border-t border-foreground/[0.04]">
              {module.lessons.map((lesson, lessonIndex) => {
                const isActive = activeLesson?.id === lesson.id;
                return (
                  <motion.button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.04 }}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-3.5 text-left transition-all duration-200 group',
                      isActive
                        ? 'bg-foreground/[0.04]'
                        : 'hover:bg-foreground/[0.02]'
                    )}
                  >
                    {/* Lesson play/number indicator */}
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-all duration-300',
                        isActive
                          ? 'text-white shadow-md'
                          : 'bg-foreground/[0.05] text-foreground/40 group-hover:bg-foreground/[0.08]'
                      )}
                      style={
                        isActive
                          ? { background: courseGradient, boxShadow: `0 2px 8px ${courseColor}30` }
                          : undefined
                      }
                    >
                      {isActive ? <Play className="h-3.5 w-3.5" /> : lessonIndex + 1}
                    </span>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate transition-colors',
                          isActive
                            ? 'text-foreground/90'
                            : 'text-foreground/60 group-hover:text-foreground/75'
                        )}
                      >
                        {lesson.title}
                      </p>
                      {lesson.description && (
                        <p className="text-xs text-foreground/35 truncate mt-0.5">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    {lesson.duration_minutes && (
                      <span className="shrink-0 text-xs text-foreground/30 tabular-nums">
                        {lesson.duration_minutes} min
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Resources section */}
            {module.resources.length > 0 && (
              <div className="border-t border-foreground/[0.04] px-5 py-3">
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">
                  Resources
                </p>
                <div className="flex flex-wrap gap-2">
                  {module.resources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => handleDownload(resource)}
                      disabled={downloadingId === resource.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-foreground/[0.04] text-foreground/50 hover:bg-foreground/[0.08] hover:text-foreground/70 transition-all disabled:opacity-50"
                    >
                      {downloadingId === resource.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-3 w-3 border border-current border-t-transparent rounded-full"
                        />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      {resource.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
