import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { CourseResource } from '@/hooks/useCourseData';

interface ResourceViewerProps {
  resources: CourseResource[];
  courseColor: string;
  className?: string;
}

export default function ResourceViewer({ resources, courseColor, className }: ResourceViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pdfResources = resources.filter(r => r.resource_type === 'pdf');
  const activeResource = pdfResources[activeIndex];

  // Fetch authenticated PDF URL
  useEffect(() => {
    if (!activeResource) {
      setPdfUrl(null);
      return;
    }

    const fetchPdfUrl = async () => {
      setLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.access_token) {
          setPdfUrl(null);
          return;
        }

        const resourcePath = activeResource.file_path.startsWith('/')
          ? activeResource.file_path.slice(1)
          : activeResource.file_path;

        const response = await fetch(
          `https://stepwise.education/resources/${resourcePath}`,
          {
            headers: {
              Authorization: `Bearer ${session.session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          console.error('Failed to fetch PDF:', response.statusText);
          setPdfUrl(null);
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
        setPdfUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPdfUrl();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [activeResource?.id]);

  if (pdfResources.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex flex-col items-center justify-center h-full bg-foreground/[0.02] rounded-xl border border-foreground/[0.06]',
          className
        )}
      >
        <FileText className="h-8 w-8 text-foreground/20 mb-2" />
        <p className="text-sm text-foreground/40">No resources for this lesson</p>
      </motion.div>
    );
  }

  const handleDownload = async () => {
    if (!activeResource) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      const resourcePath = activeResource.file_path.startsWith('/')
        ? activeResource.file_path.slice(1)
        : activeResource.file_path;

      const response = await fetch(
        `https://stepwise.education/resources/${resourcePath}`,
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
        a.download = activeResource.title + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < pdfResources.length - 1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1
        }}
        className={cn(
          'flex flex-col rounded-2xl border border-foreground/[0.06] bg-gradient-to-b from-background to-background/80 overflow-hidden shadow-xl relative',
          className
        )}
      >
        {/* PDF Viewer - full height */}
        <div className="flex-1 relative bg-foreground/[0.02]">
          {/* Floating action buttons overlay */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="absolute top-3 right-3 z-10 flex items-center gap-1.5"
          >
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white/90 transition-all shadow-lg"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.7)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(true)}
              className="p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white/90 transition-all shadow-lg"
              title="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </motion.button>
          </motion.div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-8 w-8 border-2 border-foreground/10 rounded-full"
                  style={{ borderTopColor: courseColor }}
                />
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-foreground/40 mt-3"
                >
                  Loading...
                </motion.p>
              </motion.div>
            ) : pdfUrl ? (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full"
                  title={activeResource?.title}
                />
              </motion.div>
            ) : (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <FileText className="h-10 w-10 text-foreground/15 mb-3" />
                <p className="text-sm text-foreground/40">Unable to load PDF</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating navigation (if multiple resources) */}
        {pdfResources.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm shadow-lg"
          >
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIndex(i => i - 1)}
              disabled={!hasPrev}
              className={cn(
                'p-1 rounded-lg transition-colors',
                hasPrev ? 'text-white/80 hover:text-white' : 'text-white/30'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <div className="flex gap-1.5">
              {pdfResources.map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveIndex(idx)}
                  className="relative"
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    animate={{
                      scale: idx === activeIndex ? 1 : 0.75,
                      opacity: idx === activeIndex ? 1 : 0.5,
                    }}
                    style={{ background: idx === activeIndex ? courseColor : 'rgba(255,255,255,0.6)' }}
                  />
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveIndex(i => i + 1)}
              disabled={!hasNext}
              className={cn(
                'p-1 rounded-lg transition-colors',
                hasNext ? 'text-white/80 hover:text-white' : 'text-white/30'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className="w-full max-w-5xl h-[90vh] bg-background rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between px-5 py-4 bg-foreground/[0.02] border-b border-foreground/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${courseColor}20` }}
                  >
                    <FileText className="h-5 w-5" style={{ color: courseColor }} />
                  </motion.div>
                  <div>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-semibold text-foreground/85"
                    >
                      {activeResource?.title}
                    </motion.p>
                    {pdfResources.length > 1 && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xs text-foreground/40"
                      >
                        Resource {activeIndex + 1} of {pdfResources.length}
                      </motion.p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground/[0.05] hover:bg-foreground/[0.08] text-foreground/60 text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-lg hover:bg-foreground/[0.06] text-foreground/50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Modal PDF Viewer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 relative"
              >
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=1`}
                    className="w-full h-full"
                    title={activeResource?.title}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-foreground/20 mb-3" />
                    <p className="text-foreground/40">Unable to load PDF</p>
                  </div>
                )}
              </motion.div>

              {/* Modal Navigation */}
              {pdfResources.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center gap-4 py-4 border-t border-foreground/[0.06]"
                >
                  <motion.button
                    whileHover={{ x: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveIndex(i => i - 1)}
                    disabled={!hasPrev}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      hasPrev
                        ? 'hover:bg-foreground/[0.06] text-foreground/60'
                        : 'text-foreground/20 cursor-not-allowed'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </motion.button>
                  <div className="flex gap-2">
                    {pdfResources.map((_, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setActiveIndex(idx)}
                      >
                        <motion.div
                          className="w-2.5 h-2.5 rounded-full"
                          animate={{
                            scale: idx === activeIndex ? 1.2 : 1,
                            opacity: idx === activeIndex ? 1 : 0.4,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          style={{ background: idx === activeIndex ? courseColor : 'currentColor' }}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ x: 3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveIndex(i => i + 1)}
                    disabled={!hasNext}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      hasNext
                        ? 'hover:bg-foreground/[0.06] text-foreground/60'
                        : 'text-foreground/20 cursor-not-allowed'
                    )}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
