import { Mail, MessageCircle, Clock, CheckCheck, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMessagesForRegistration } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';
import type { Message } from '@/hooks/useMessages';
import { Badge } from '@/components/ui/badge';

interface Props {
  registrationId: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  Draft: { icon: Clock, color: 'text-muted-foreground', label: 'Draft' },
  Queued: { icon: Loader2, color: 'text-stage-chemistry', label: 'Queued' },
  Sent: { icon: CheckCheck, color: 'text-stage-approval', label: 'Sent' },
  Delivered: { icon: CheckCheck, color: 'text-stage-interview', label: 'Delivered' },
  Failed: { icon: XCircle, color: 'text-destructive', label: 'Failed' },
};

function MessageRow({ message }: { message: Message }) {
  const config = STATUS_CONFIG[message.status] || STATUS_CONFIG.Draft;
  const StatusIcon = config.icon;
  const isEmail = message.channel === 'Email';
  const ChannelIcon = isEmail ? Mail : MessageCircle;

  return (
    <div className="flex items-start gap-2.5 rounded-md border bg-gradient-card p-2.5 hover-border-glow transition-all duration-200">
      <div className={cn('mt-0.5 rounded p-1', isEmail ? 'bg-stage-approval-light' : 'bg-stage-chemistry-light')}>
        <ChannelIcon className={cn('h-3 w-3', isEmail ? 'text-stage-approval' : 'text-stage-chemistry')} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {isEmail && message.subject && (
            <span className="text-xs font-medium text-foreground truncate">{message.subject}</span>
          )}
          {!isEmail && (
            <span className="text-xs font-medium text-foreground">Signal message</span>
          )}
          <Badge variant="outline" className={cn('text-[9px] px-1 py-0 ml-auto shrink-0', config.color)}>
            <StatusIcon className={cn('h-2 w-2 mr-0.5', message.status === 'Queued' && 'animate-spin')} />
            {config.label}
          </Badge>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{message.body}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>→ {message.to_address}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
        </div>
        {message.error_message && (
          <div className="mt-1 flex items-start gap-1 rounded bg-destructive/10 px-1.5 py-1 text-[10px] text-destructive">
            <AlertTriangle className="h-2.5 w-2.5 mt-0.5 shrink-0" />
            {message.error_message}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageHistory({ registrationId }: Props) {
  const { data: messages, isLoading } = useMessagesForRegistration(registrationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading messages…
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-secondary/30 p-3 text-center">
        <Mail className="h-5 w-5 mx-auto text-muted-foreground/40 mb-1.5" />
        <p className="text-xs text-muted-foreground">No messages sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <MessageRow key={msg.id} message={msg} />
      ))}
    </div>
  );
}
