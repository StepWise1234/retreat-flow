import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMessageTemplates, useSendMessage } from '@/hooks/useMessages';
import { useEmailSettings, useSignalSettings } from '@/hooks/useIntegrationSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Participant, Registration, Retreat } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  participant: Participant;
  registration: Registration;
  retreat: Retreat;
}

export default function MessageComposer({ open, onClose, participant, registration, retreat }: Props) {
  const [channel, setChannel] = useState<'Email' | 'Signal'>('Email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const { data: templates } = useMessageTemplates(channel);
  const { data: emailSettings } = useEmailSettings();
  const { data: signalSettings } = useSignalSettings();
  const sendMessage = useSendMessage();

  const hasSignalContact = participant.signalHandle.trim().length > 0;
  const emailConfigured = !!(emailSettings?.smtp_host && emailSettings?.from_email);
  const signalConfigured = !!(signalSettings?.signal_api_base_url && signalSettings?.signal_sender_id);

  // Apply template
  useEffect(() => {
    if (!selectedTemplateId || !templates) return;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    const firstName = participant.fullName.split(' ')[0] || participant.fullName;
    const interpolate = (text: string) =>
      text
        .replace(/\{\{firstName\}\}/g, firstName)
        .replace(/\{\{fullName\}\}/g, participant.fullName)
        .replace(/\{\{retreatName\}\}/g, retreat.retreatName)
        .replace(/\{\{paymentLink\}\}/g, retreat.paymentLink || '#')
        .replace(/\{\{scheduleLink\}\}/g, retreat.chemistryCallLink || '#');

    setSubject(tpl.subject ? interpolate(tpl.subject) : '');
    setBody(interpolate(tpl.body));
  }, [selectedTemplateId, templates, participant, retreat]);

  // Reset on channel switch
  useEffect(() => {
    setSelectedTemplateId('');
    setSubject('');
    setBody('');
  }, [channel]);

  const canSendDirectly = channel === 'Email' ? emailConfigured : signalConfigured;

  const handleSend = async () => {
    if (!body.trim()) {
      toast.error('Message body cannot be empty');
      return;
    }

    const toAddress = channel === 'Email' ? participant.email : participant.signalHandle;
    if (!toAddress.trim()) {
      toast.error(`No ${channel === 'Email' ? 'email' : 'Signal handle'} for this participant`);
      return;
    }

    try {
      await sendMessage.mutateAsync({
        registration_id: registration.id,
        participant_id: participant.id,
        retreat_id: retreat.id,
        channel,
        subject: channel === 'Email' ? subject : null,
        body,
        to_address: toAddress,
        from_address: channel === 'Email' ? emailSettings?.from_email || '' : signalSettings?.signal_sender_id || '',
        template_id: selectedTemplateId || null,
        status: 'Queued',
        idempotency_key: crypto.randomUUID(),
      });
      toast.success(
        canSendDirectly
          ? `${channel} message sent to ${participant.fullName}`
          : `${channel} message queued for ${participant.fullName} (integration not configured)`
      );
      onClose();
    } catch (err: any) {
      toast.error(`Failed to send message: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send message to {participant.fullName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={channel} onValueChange={(v) => setChannel(v as 'Email' | 'Signal')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Email" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
              {!emailConfigured && <span className="text-[9px] text-destructive">●</span>}
            </TabsTrigger>
            <TabsTrigger value="Signal" className="gap-1.5" disabled={!hasSignalContact}>
              <MessageCircle className="h-3.5 w-3.5" />
              Signal
              {!signalConfigured && <span className="text-[9px] text-destructive">●</span>}
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            {/* Config warning */}
            {channel === 'Email' && !emailConfigured && (
              <div className="rounded-md bg-stage-payment-light p-2 text-xs text-stage-payment">
                ⚠️ Proton Mail Bridge not configured. Messages will be queued but not sent until SMTP is set up.
              </div>
            )}
            {channel === 'Signal' && !signalConfigured && (
              <div className="rounded-md bg-stage-payment-light p-2 text-xs text-stage-payment">
                ⚠️ Signal Bridge not configured. Messages will be queued but not sent until the bridge is set up.
              </div>
            )}

            {/* To field */}
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                value={channel === 'Email' ? participant.email : participant.signalHandle}
                disabled
                className="text-sm bg-secondary/50"
              />
            </div>

            {/* Template selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Template (optional)</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Choose a template…" />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.name} {tpl.stage && `· ${tpl.stage}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject (email only) */}
            {channel === 'Email' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject…"
                  className="text-sm"
                />
              </div>
            )}

            {/* Body */}
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={channel === 'Signal' ? 'Signal message…' : 'Email body…'}
                className={cn('text-sm resize-none', channel === 'Signal' ? 'h-24' : 'h-32')}
              />
            </div>
          </div>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sendMessage.isPending || !body.trim()}
            className="gap-1.5"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {canSendDirectly ? `Send via ${channel === 'Email' ? 'Proton Mail' : 'Signal'}` : `Queue ${channel} message`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
