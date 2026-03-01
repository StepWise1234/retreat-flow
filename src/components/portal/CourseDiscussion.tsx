import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Reply, Trash2, MoreHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import {
  useLessonDiscussions,
  useCreateDiscussion,
  useDeleteDiscussion,
  type CourseDiscussion as DiscussionType,
} from '@/hooks/useCourseData';
import { formatDistanceToNow } from 'date-fns';

interface CourseDiscussionProps {
  lessonId: string | null;
  lessonTitle: string;
  courseColor: string;
  courseGradient: string;
}

export default function CourseDiscussion({
  lessonId,
  lessonTitle,
  courseColor,
  courseGradient,
}: CourseDiscussionProps) {
  const { user } = usePortalAuth();
  const { data: discussions = [], isLoading } = useLessonDiscussions(lessonId);
  const createDiscussion = useCreateDiscussion();
  const deleteDiscussion = useDeleteDiscussion();

  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonId || !newPost.trim()) return;

    try {
      await createDiscussion.mutateAsync({
        lessonId,
        content: newPost.trim(),
      });
      setNewPost('');
    } catch (error) {
      console.error('Failed to post:', error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!lessonId || !replyContent.trim()) return;

    try {
      await createDiscussion.mutateAsync({
        lessonId,
        content: replyContent.trim(),
        parentId,
      });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const handleDelete = async (discussionId: string) => {
    if (!lessonId) return;
    try {
      await deleteDiscussion.mutateAsync({ discussionId, lessonId });
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Get user initials from email
  const getInitials = (userId: string) => {
    // In a real app, you'd fetch user profile info
    // For now, use first 2 chars of user ID
    return userId.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (userId: string) => {
    // Generate consistent color from user ID
    const colors = ['#FFA500', '#FF4500', '#800080', '#14B8A6', '#8B5CF6', '#EC4899'];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!lessonId) {
    return (
      <div className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-8 text-center">
        <MessageCircle className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-foreground/40">Select a lesson to view discussions</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between border-b border-foreground/[0.06] hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center h-9 w-9 rounded-xl"
            style={{ background: courseGradient }}
          >
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground/70">Discussion</h3>
            <p className="text-xs text-foreground/40">
              {discussions.length} post{discussions.length !== 1 ? 's' : ''} about this lesson
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-foreground/30" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {/* Post form */}
            {user && (
              <form onSubmit={handleSubmitPost} className="px-6 py-4 border-b border-foreground/[0.04]">
                <div className="flex gap-3">
                  <div
                    className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(user.id) }}
                  >
                    {getInitials(user.id)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share your experience or ask a question..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] text-sm text-foreground/80 placeholder:text-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                      style={{ '--tw-ring-color': courseColor } as React.CSSProperties}
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newPost.trim() || createDiscussion.isPending}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all',
                          !newPost.trim() || createDiscussion.isPending
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:brightness-110'
                        )}
                        style={{ background: courseGradient }}
                      >
                        {createDiscussion.isPending ? (
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Discussions list */}
            <div className="divide-y divide-foreground/[0.04]">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground/50 rounded-full animate-spin mx-auto" />
                </div>
              ) : discussions.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-8 w-8 text-foreground/15 mx-auto mb-3" />
                  <p className="text-sm text-foreground/40">No discussions yet</p>
                  <p className="text-xs text-foreground/30 mt-1">Be the first to share your thoughts!</p>
                </div>
              ) : (
                discussions.map((discussion, index) => (
                  <DiscussionPost
                    key={discussion.id}
                    discussion={discussion}
                    index={index}
                    courseColor={courseColor}
                    courseGradient={courseGradient}
                    currentUserId={user?.id}
                    replyingTo={replyingTo}
                    replyContent={replyContent}
                    setReplyingTo={setReplyingTo}
                    setReplyContent={setReplyContent}
                    onSubmitReply={handleSubmitReply}
                    onDelete={handleDelete}
                    isSubmitting={createDiscussion.isPending}
                    getInitials={getInitials}
                    getAvatarColor={getAvatarColor}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface DiscussionPostProps {
  discussion: DiscussionType;
  index: number;
  courseColor: string;
  courseGradient: string;
  currentUserId?: string;
  replyingTo: string | null;
  replyContent: string;
  setReplyingTo: (id: string | null) => void;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  onDelete: (discussionId: string) => void;
  isSubmitting: boolean;
  getInitials: (userId: string) => string;
  getAvatarColor: (userId: string) => string;
}

function DiscussionPost({
  discussion,
  index,
  courseColor,
  courseGradient,
  currentUserId,
  replyingTo,
  replyContent,
  setReplyingTo,
  setReplyContent,
  onSubmitReply,
  onDelete,
  isSubmitting,
  getInitials,
  getAvatarColor,
}: DiscussionPostProps) {
  const isOwn = currentUserId === discussion.user_id;
  const isReplying = replyingTo === discussion.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="px-6 py-4"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className="shrink-0 flex items-center justify-center h-9 w-9 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: getAvatarColor(discussion.user_id) }}
        >
          {getInitials(discussion.user_id)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/70">
                {isOwn ? 'You' : 'Anonymous'}
              </span>
              <span className="text-xs text-foreground/30">
                {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
              </span>
            </div>
            {isOwn && (
              <button
                onClick={() => onDelete(discussion.id)}
                className="p-1.5 rounded-lg text-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-foreground/60 leading-relaxed mt-1.5 whitespace-pre-wrap">
            {discussion.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setReplyingTo(isReplying ? null : discussion.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-foreground/40 hover:text-foreground/60 hover:bg-foreground/[0.04] transition-all"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          </div>

          {/* Reply form */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="flex gap-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    autoFocus
                    className="flex-1 px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06] text-sm text-foreground/80 placeholder:text-foreground/30 resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                    style={{ '--tw-ring-color': courseColor } as React.CSSProperties}
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onSubmitReply(discussion.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                      className="flex-1 flex items-center justify-center px-3 rounded-lg text-white transition-all disabled:opacity-50"
                      style={{ background: courseGradient }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="flex-1 flex items-center justify-center px-3 rounded-lg text-foreground/40 hover:text-foreground/60 bg-foreground/[0.04] hover:bg-foreground/[0.06] transition-all"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {discussion.replies && discussion.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-foreground/[0.06]">
              {discussion.replies.map((reply, replyIndex) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: replyIndex * 0.03 }}
                  className="flex gap-2"
                >
                  <div
                    className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(reply.user_id) }}
                  >
                    {getInitials(reply.user_id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground/60">
                        {currentUserId === reply.user_id ? 'You' : 'Anonymous'}
                      </span>
                      <span className="text-[10px] text-foreground/30">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                      {currentUserId === reply.user_id && (
                        <button
                          onClick={() => onDelete(reply.id)}
                          className="p-1 rounded text-foreground/25 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed mt-0.5">
                      {reply.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
