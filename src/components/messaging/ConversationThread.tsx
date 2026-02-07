import { useEffect, useRef } from 'react';
import { Mail, MessageCircle, ArrowDownLeft, ArrowUpRight, RotateCcw, CheckCheck, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/contexts/AppContext';
import { useConversation, useMarkConversationRead } from '@/hooks/useConversations';
import { useMessagesForConversation, useRetrySendMessage, type Message } from '@/hooks/useMessages';
import { STAGE_STYLE_MAP, RISK_LEVEL_STYLES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ThreadComposer from './ThreadComposer';

interface Props {
  conversationId: string | null;
  onOpenParticipant?: (registrationId: string) => void;
}

export default function ConversationThread({ conversationId, onOpenParticipant }: Props) {
  const { participants, retreats, registrations } = useApp();
  const { data: conversation } = useConversation(conversationId);
  const { data: messages = [], isLoading } = useMessagesForConversation(conversationId ?? undefined);
  const markRead = useMarkConversationRead();
  const retrySend = useRetrySendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const participant = conversation
    ? participants.find((p) => p.id === conversation.participant_id)
    : null;
  const retreat = conversation?.retreat_id
    ? retreats.find((r) => r.id === conversation.retreat_id)
    : null;
  const registration = conversation?.registration_id
    ? registrations.find((r) => r.id === conversation.registration_id)
    : null;

  // Mark as read when opening
  useEffect(() => {
    if (conversationId && conversation && conversation.unread_count > 0) {
      markRead.mutate(conversationId);
    }
  }, [conversationId, conversation?.unread_count]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">Select a conversation</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Choose a conversation from the left to view messages
          </p>
        </div>
      </div>
    );
  }

  if (!conversation || !participant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading conversation…</p>
      </div>
    );
  }

  const stageStyle = registration ? STAGE_STYLE_MAP[registration.currentStage] : null;
  const riskStyle = registration && registration.riskLevel !== 'None'
    ? RISK_LEVEL_STYLES[registration.riskLevel]
    : null;

  // Sort messages chronologically (oldest first)
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleRetry = async (msg: Message) => {
    try {
      await retrySend.mutateAsync(msg);
      toast.success('Message queued for retry');
    } catch {
      toast.error('Retry failed');
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Thread header */}
      <div className="border-b px-5 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">{participant.fullName}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>{participant.email}</span>
              {participant.signalHandle && (
                <>
                  <span>·</span>
                  <span>{participant.signalHandle}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stageStyle && registration && (
              <Badge variant="outline" className={cn('text-[11px]', stageStyle.bg, stageStyle.text)}>
                {registration.currentStage}
              </Badge>
            )}
            {riskStyle && registration && (
              <Badge variant="outline" className={cn('text-[11px]', riskStyle.bg, riskStyle.text)}>
                ⚠ {registration.riskLevel} Risk
              </Badge>
            )}
            {registration && onOpenParticipant && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onOpenParticipant(registration.id)}
              >
                <ExternalLink className="h-3 w-3" />
                Detail
              </Button>
            )}
          </div>
        </div>

        {retreat && (
          <div className="mt-1.5">
            <Badge variant="secondary" className="text-[10px]">
              {retreat.retreatName}
            </Badge>
            {registration && (
              <Badge
                variant="outline"
                className={cn(
                  'ml-1 text-[10px]',
                  registration.paymentStatus === 'Paid' ? 'bg-stage-interview-light text-stage-interview' :
                  registration.paymentStatus === 'Partial' ? 'bg-stage-payment-light text-stage-payment' :
                  'bg-secondary text-muted-foreground'
                )}
              >
                {registration.paymentStatus}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Messages timeline */}
      <ScrollArea className="flex-1 px-5 py-4" ref={scrollRef}>
        {isLoading ? (
          <div className="text-center text-xs text-muted-foreground py-8">Loading messages…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-xs text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((msg) => {
              const isInbound = msg.direction === 'Inbound';
              const isFailed = msg.status === 'Failed';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-3',
                    isInbound ? 'justify-start' : 'justify-end'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-xl px-4 py-2.5',
                      isInbound
                        ? 'bg-secondary/70 text-foreground'
                        : isFailed
                          ? 'bg-destructive/10 text-foreground border border-destructive/30'
                          : 'bg-primary/10 text-foreground'
                    )}
                  >
                    {/* Channel + direction badge */}
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {msg.channel === 'Email' ? (
                        <Mail className="h-2.5 w-2.5" />
                      ) : (
                        <MessageCircle className="h-2.5 w-2.5" />
                      )}
                      <span>{msg.channel}</span>
                      {isInbound ? (
                        <ArrowDownLeft className="h-2.5 w-2.5 text-stage-interview" />
                      ) : (
                        <ArrowUpRight className="h-2.5 w-2.5 text-primary" />
                      )}
                      <span>{isInbound ? 'Received' : 'Sent'}</span>
                    </div>

                    {/* Subject (email) */}
                    {msg.subject && (
                      <div className="mb-1 text-xs font-medium text-foreground">
                        {msg.subject}
                      </div>
                    )}

                    {/* Body */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>

                    {/* Footer: status + timestamp */}
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        {!isInbound && (
                          <span className={cn(
                            'flex items-center gap-0.5 text-[10px]',
                            isFailed ? 'text-destructive' :
                            msg.status === 'Delivered' ? 'text-stage-interview' :
                            msg.status === 'Sent' ? 'text-primary' :
                            'text-muted-foreground'
                          )}>
                            {isFailed ? (
                              <AlertTriangle className="h-2.5 w-2.5" />
                            ) : msg.status === 'Delivered' ? (
                              <CheckCheck className="h-2.5 w-2.5" />
                            ) : msg.status === 'Queued' ? (
                              <Clock className="h-2.5 w-2.5" />
                            ) : null}
                            {msg.status}
                          </span>
                        )}
                        {isInbound && msg.read_status === 'Unread' && (
                          <Badge variant="default" className="h-3.5 px-1 text-[9px]">New</Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(new Date(msg.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    {/* Failed: error + retry */}
                    {isFailed && (
                      <div className="mt-2 flex items-center gap-2 rounded bg-destructive/5 px-2 py-1">
                        <span className="flex-1 text-[10px] text-destructive">
                          {msg.error_message || 'Send failed'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 gap-1 px-1.5 text-[10px] text-destructive hover:text-destructive"
                          onClick={() => handleRetry(msg)}
                          disabled={retrySend.isPending}
                        >
                          <RotateCcw className="h-2.5 w-2.5" />
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <Separator />

      {/* Composer */}
      <ThreadComposer
        conversation={conversation}
        participant={participant}
        retreat={retreat ?? undefined}
        registration={registration ?? undefined}
        lastInboundChannel={sorted.filter((m) => m.direction === 'Inbound').pop()?.channel as 'Email' | 'Signal' | undefined}
      />
    </div>
  );
}
