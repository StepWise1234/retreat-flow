import { useState, useEffect } from 'react';
import { Settings2, Mail, MessageCircle, Loader2, CheckCircle, XCircle, Wifi, WifiOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  useEmailSettings,
  useUpdateEmailSettings,
  useSignalSettings,
  useUpdateSignalSettings,
  useIntegrationLogs,
} from '@/hooks/useIntegrationSettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTab?: 'email' | 'signal';
}

export default function IntegrationSettingsDialog({ open, onClose, initialTab = 'email' }: Props) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Integration Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'email' | 'signal')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Proton Mail
            </TabsTrigger>
            <TabsTrigger value="signal" className="gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Signal Bridge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-4">
            <EmailSettingsForm />
          </TabsContent>
          <TabsContent value="signal" className="mt-4">
            <SignalSettingsForm />
          </TabsContent>
        </Tabs>

        <Separator className="my-2" />
        <RecentLogs />
      </DialogContent>
    </Dialog>
  );
}

function EmailSettingsForm() {
  const { data: settings, isLoading } = useEmailSettings();
  const updateSettings = useUpdateEmailSettings();

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('1025');
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [inboundSync, setInboundSync] = useState(false);

  useEffect(() => {
    if (settings) {
      setSmtpHost(settings.smtp_host || '');
      setSmtpPort(String(settings.smtp_port || 1025));
      setSmtpUsername(settings.smtp_username || '');
      setSmtpPassword(settings.smtp_password || '');
      setFromName(settings.from_name || '');
      setFromEmail(settings.from_email || '');
      setReplyTo(settings.reply_to_email || '');
      setInboundSync(settings.enable_inbound_sync);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: {
          smtp_host: smtpHost,
          smtp_port: parseInt(smtpPort) || 1025,
          smtp_username: smtpUsername,
          smtp_password: smtpPassword,
          from_name: fromName,
          from_email: fromEmail,
          reply_to_email: replyTo || null,
          enable_inbound_sync: inboundSync,
        },
      });
      toast.success('Email settings saved');
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  if (isLoading) return <div className="py-4 text-center text-xs text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <HealthBanner
        isHealthy={settings?.is_healthy ?? false}
        lastTested={settings?.last_tested_at}
        lastError={settings?.last_error}
        provider="Proton Mail Bridge"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">SMTP Host</Label>
          <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="127.0.0.1" className="text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">SMTP Port</Label>
          <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="1025" className="text-sm h-8" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Username</Label>
          <Input value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} className="text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Password</Label>
          <Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} className="text-sm h-8" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">From Name</Label>
          <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Flight School Ops" className="text-sm h-8" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">From Email</Label>
          <Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="ops@example.com" className="text-sm h-8" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Reply-To (optional)</Label>
        <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="text-sm h-8" />
      </div>

      <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
        <div>
          <p className="text-xs font-medium text-foreground">Inbound Sync (IMAP)</p>
          <p className="text-[10px] text-muted-foreground">Pull replies from Proton Bridge (V2)</p>
        </div>
        <Switch checked={inboundSync} onCheckedChange={setInboundSync} />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending} className="gap-1.5">
          {updateSettings.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          Save settings
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs">
          Test connection
        </Button>
      </div>
    </div>
  );
}

function SignalSettingsForm() {
  const { data: settings, isLoading } = useSignalSettings();
  const updateSettings = useUpdateSignalSettings();

  const [senderId, setSenderId] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [deliveryReceipts, setDeliveryReceipts] = useState(false);

  useEffect(() => {
    if (settings) {
      setSenderId(settings.signal_sender_id || '');
      setApiBaseUrl(settings.signal_api_base_url || '');
      setApiToken(settings.signal_api_token || '');
      setDeliveryReceipts(settings.enable_delivery_receipts);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        updates: {
          signal_sender_id: senderId,
          signal_api_base_url: apiBaseUrl,
          signal_api_token: apiToken,
          enable_delivery_receipts: deliveryReceipts,
        },
      });
      toast.success('Signal settings saved');
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  if (isLoading) return <div className="py-4 text-center text-xs text-muted-foreground">Loading…</div>;

  return (
    <div className="space-y-4">
      <HealthBanner
        isHealthy={settings?.is_healthy ?? false}
        lastTested={settings?.last_tested_at}
        lastError={settings?.last_error}
        provider="Signal Bridge"
      />

      <div className="space-y-1.5">
        <Label className="text-xs">Sender ID (Phone/Handle)</Label>
        <Input value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="+1234567890" className="text-sm h-8" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">API Base URL</Label>
        <Input value={apiBaseUrl} onChange={(e) => setApiBaseUrl(e.target.value)} placeholder="http://localhost:8080" className="text-sm h-8" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">API Token</Label>
        <Input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} className="text-sm h-8" />
      </div>

      <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
        <div>
          <p className="text-xs font-medium text-foreground">Delivery Receipts</p>
          <p className="text-[10px] text-muted-foreground">Receive delivery confirmation from bridge</p>
        </div>
        <Switch checked={deliveryReceipts} onCheckedChange={setDeliveryReceipts} />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending} className="gap-1.5">
          {updateSettings.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
          Save settings
        </Button>
        <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs">
          Test Signal send
        </Button>
      </div>
    </div>
  );
}

function HealthBanner({ isHealthy, lastTested, lastError, provider }: {
  isHealthy: boolean;
  lastTested: string | null | undefined;
  lastError: string | null | undefined;
  provider: string;
}) {
  return (
    <div className={cn(
      'rounded-md p-2.5 flex items-start gap-2',
      isHealthy ? 'bg-stage-interview-light' : 'bg-stage-payment-light'
    )}>
      {isHealthy ? (
        <CheckCircle className="h-4 w-4 text-stage-interview shrink-0 mt-0.5" />
      ) : (
        <WifiOff className="h-4 w-4 text-stage-payment shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p className={cn('text-xs font-medium', isHealthy ? 'text-stage-interview' : 'text-stage-payment')}>
          {provider}: {isHealthy ? 'Healthy' : 'Not connected'}
        </p>
        {lastTested && (
          <p className="text-[10px] text-muted-foreground">
            Last tested {formatDistanceToNow(new Date(lastTested), { addSuffix: true })}
          </p>
        )}
        {lastError && (
          <p className="text-[10px] text-destructive mt-0.5">{lastError}</p>
        )}
      </div>
    </div>
  );
}

function RecentLogs() {
  const { data: logs } = useIntegrationLogs(5);

  if (!logs || logs.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Recent Integration Logs
      </h4>
      <div className="space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-2 rounded bg-secondary/40 px-2 py-1.5 text-[10px]">
            {log.status === 'success' ? (
              <CheckCircle className="h-2.5 w-2.5 text-stage-interview shrink-0" />
            ) : (
              <XCircle className="h-2.5 w-2.5 text-destructive shrink-0" />
            )}
            <span className="font-medium text-foreground">{log.provider}</span>
            <span className="text-muted-foreground">{log.action}</span>
            {log.error && <span className="text-destructive truncate ml-auto">{log.error}</span>}
            <span className="text-muted-foreground ml-auto shrink-0">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
