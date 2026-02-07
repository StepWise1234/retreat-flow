import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMessageTemplates, useSendMessage } from '@/hooks/useMessages';
import { useEmailSettings, useSignalSettings } from '@/hooks/useIntegrationSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/hooks/useConversations';
import type { Participant, Registration, Retreat } from '@/lib/types';

interface Props {
  conversation: Conversation;
  participant: Participant;
  retreat?: Retreat;
  registration?: Registration;
  lastInboundChannel?: 'Email' | 'Signal';
}

export default function ThreadComposer({
  conversation,
  participant,
  retreat,
  registration,
  lastInboundChannel,
}: Props) {
  const [channel, setChannel] = useState<'Email' | 'Signal'>(lastInboundChannel ?? 'Email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');

  const { data: templates } = useMessageTemplates(channel);
  const { data: emailSettings } = useEmailSettings();
  const { data: signalSettings } = useSignalSettings();
  const sendMessage = useSendMessage();

  const hasSignal = participant.signalHandle.trim().length > 0;
  const emailConfigured = !!(emailSettings?.smtp_host && emailSettings?.from_email);
  const signalConfigured = !!(signalSettings?.signal_api_base_url && signalSettings?.signal_sender_id);

  // Apply template
  useEffect(() => {
    if (!templateId || !templates) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    const firstName = participant.fullName.split(' ')[0] || participant.fullName;
    const interpolate = (text: string) =>
      text
        .replace(/\{\{firstName\}\}/g, firstName)
        .replace(/\{\{fullName\}\}/g, participant.fullName)
        .replace(/\{\{retreatName\}\}/g, retreat?.retreatName ?? '')
        .replace(/\{\{paymentLink\}\}/g, retreat?.paymentLink || '#')
        .replace(/\{\{scheduleLink\}\}/g, retreat?.chemistryCallLink || '#');

    setSubject(tpl.subject ? interpolate(tpl.subject) : '');
    setBody(interpolate(tpl.body));
  }, [templateId, templates, participant, retreat]);

  // Reset on channel change
  useEffect(() => {
    setTemplateId('');
    setSubject('');
    setBody('');
  }, [channel]);

  const canSendDirectly = channel === 'Email' ? emailConfigured : signalConfigured;

  const handleSend = async () => {
    if (!body.trim()) return;

    const toAddress = channel === 'Email' ? participant.email : participant.signalHandle;
    if (!toAddress.trim()) {
      toast.error(`No ${channel === 'Email' ? 'email' : 'Signal handle'} for this participant`);
      return;
    }

    try {
      await sendMessage.mutateAsync({
        registration_id: registration?.id ?? conversation.registration_id ?? '',
        participant_id: participant.id,
        retreat_id: retreat?.id ?? conversation.retreat_id ?? '',
        channel,
        subject: channel === 'Email' ? subject : null,
        body,
        to_address: toAddress,
        from_address: channel === 'Email'
          ? emailSettings?.from_email || ''
          : signalSettings?.signal_sender_id || '',
        template_id: templateId || null,
        status: 'Queued',
        idempotency_key: crypto.randomUUID(),
        conversation_id: conversation.id,
        direction: 'Outbound',
        read_status: 'Read',
      });
      toast.success(
        canSendDirectly
          ? `${channel} sent to ${participant.fullName}`
          : `${channel} queued for ${participant.fullName}`
      );
      setBody('');
      setSubject('');
      setTemplateId('');
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && body.trim()) {
      handleSend();
    }
  };

  return (
    <div className="border-t bg-card/50 px-4 py-3 space-y-2">
      {/* Channel + template row */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border overflow-hidden">
          <button
            onClick={() => setChannel('Email')}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 text-[11px] transition-colors',
              channel === 'Email'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-secondary'
            )}
          >
            <Mail className="h-3 w-3" /> Email
          </button>
          <button
            onClick={() => hasSignal && setChannel('Signal')}
            disabled={!hasSignal}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 text-[11px] transition-colors',
              channel === 'Signal'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-secondary',
              !hasSignal && 'opacity-40 cursor-not-allowed'
            )}
          >
            <MessageCircle className="h-3 w-3" /> Signal
          </button>
        </div>

        <Select value={templateId} onValueChange={setTemplateId}>
          <SelectTrigger className="h-7 w-auto min-w-[120px] text-[11px]">
            <SelectValue placeholder="Template…" />
          </SelectTrigger>
          <SelectContent>
            {templates?.map((tpl) => (
              <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                {tpl.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!canSendDirectly && (
          <span className="text-[10px] text-stage-payment">
            ⚠ {channel} not configured — will queue
          </span>
        )}
      </div>

      {/* Subject (email) */}
      {channel === 'Email' && (
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject…"
          className="h-7 text-xs"
        />
      )}

      {/* Body + send */}
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Reply via ${channel}… (⌘+Enter to send)`}
          className={cn('flex-1 text-xs resize-none', channel === 'Signal' ? 'h-16' : 'h-20')}
        />
        <Button
          size="sm"
          className="h-8 gap-1"
          disabled={sendMessage.isPending || !body.trim()}
          onClick={handleSend}
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
