import { Mail, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { useEmailSettings, useSignalSettings } from '@/hooks/useIntegrationSettings';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  type: 'email' | 'signal';
  compact?: boolean;
}

export default function IntegrationStatusBadge({ type, compact = false }: Props) {
  const { data: emailSettings } = useEmailSettings();
  const { data: signalSettings } = useSignalSettings();

  const isEmail = type === 'email';
  const settings = isEmail ? emailSettings : signalSettings;
  const isHealthy = settings?.is_healthy ?? false;
  const isConfigured = isEmail
    ? !!(emailSettings?.smtp_host && emailSettings?.from_email)
    : !!(signalSettings?.signal_api_base_url && signalSettings?.signal_sender_id);

  const status = isHealthy ? 'Healthy' : isConfigured ? 'Degraded' : 'Offline';
  const statusColor = isHealthy
    ? 'text-stage-interview bg-stage-interview-light'
    : isConfigured
    ? 'text-stage-payment bg-stage-payment-light'
    : 'text-muted-foreground bg-secondary';

  const Icon = isEmail ? Mail : MessageCircle;
  const StatusIcon = isHealthy ? Wifi : WifiOff;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium', statusColor)}>
            <Icon className="h-2.5 w-2.5" />
            <StatusIcon className="h-2 w-2" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{isEmail ? 'Proton Mail' : 'Signal'}: {status}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium', statusColor)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{isEmail ? 'Proton Mail' : 'Signal'}</span>
      <span className="opacity-60">·</span>
      <StatusIcon className="h-3 w-3" />
      <span>{status}</span>
    </div>
  );
}
