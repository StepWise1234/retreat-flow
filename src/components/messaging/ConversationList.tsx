import { useState } from 'react';
import { Mail, MessageCircle, Search, Filter, Inbox, Archive as ArchiveIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useConversations, type Conversation, type ConversationFilters } from '@/hooks/useConversations';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { RISK_LEVEL_STYLES } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({ selectedId, onSelect }: Props) {
  const { participants, retreats, registrations } = useApp();
  const [search, setSearch] = useState('');
  const [filterRetreat, setFilterRetreat] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'Email' | 'Signal'>('all');
  const [filterUnread, setFilterUnread] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const filters: ConversationFilters = {
    retreatId: filterRetreat !== 'all' ? filterRetreat : undefined,
    channel: filterChannel,
    unreadOnly: filterUnread,
    isArchived: showArchived,
  };

  const { data: conversations = [], isLoading } = useConversations(filters);

  // Filter by search text (participant name/email/signal)
  const filtered = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const participant = participants.find((p) => p.id === conv.participant_id);
    if (!participant) return false;
    const q = search.toLowerCase();
    return (
      participant.fullName.toLowerCase().includes(q) ||
      participant.email.toLowerCase().includes(q) ||
      participant.signalHandle.toLowerCase().includes(q) ||
      (conv.last_message_preview?.toLowerCase().includes(q) ?? false)
    );
  });

  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.fullName ?? 'Unknown';

  const getRetreatLabel = (retreatId: string | null) => {
    if (!retreatId) return null;
    const r = retreats.find((rt) => rt.id === retreatId);
    return r ? r.retreatName : null;
  };

  const getRegistrationRisk = (regId: string | null) => {
    if (!regId) return 'None';
    const reg = registrations.find((r) => r.id === regId);
    return reg?.riskLevel ?? 'None';
  };

  const activeRetreats = retreats.filter((r) => r.status !== 'Archived');

  return (
    <div className="flex h-full flex-col border-r bg-gradient-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Inbox className="h-4 w-4" />
          Conversations
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant={showArchived ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setShowArchived(!showArchived)}
            title={showArchived ? 'Show active' : 'Show archived'}
          >
            <ArchiveIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, message..."
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 px-3 pb-2">
        <Select value={filterRetreat} onValueChange={setFilterRetreat}>
          <SelectTrigger className="h-7 w-auto min-w-[100px] text-[11px]">
            <SelectValue placeholder="All retreats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All retreats</SelectItem>
            {activeRetreats.map((r) => (
              <SelectItem key={r.id} value={r.id} className="text-xs">
                {r.retreatName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterChannel} onValueChange={(v) => setFilterChannel(v as any)}>
          <SelectTrigger className="h-7 w-auto min-w-[80px] text-[11px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Signal">Signal</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={filterUnread ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => setFilterUnread(!filterUnread)}
        >
          Unread
        </Button>
      </div>

      <Separator />

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-xs text-muted-foreground">
              {showArchived ? 'No archived conversations' : 'No conversations yet'}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/60">
              Send a message from a participant card to start one
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((conv) => {
              const risk = getRegistrationRisk(conv.registration_id);
              const riskStyle = risk !== 'None' ? RISK_LEVEL_STYLES[risk] : null;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50',
                    selectedId === conv.id && 'bg-secondary/70 border-l-2 border-primary'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {getParticipantName(conv.participant_id)}
                      </span>
                      {conv.unread_count > 0 && (
                        <Badge variant="default" className="h-4 min-w-[16px] px-1 text-[10px]">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>

                    {/* Channel pills + retreat tag */}
                    <div className="mt-0.5 flex items-center gap-1">
                      {conv.channels_enabled.includes('Email') && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Mail className="h-2.5 w-2.5" /> Email
                        </span>
                      )}
                      {conv.channels_enabled.includes('Signal') && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MessageCircle className="h-2.5 w-2.5" /> Signal
                        </span>
                      )}
                      {riskStyle && (
                        <Badge variant="outline" className={cn('h-4 text-[9px] px-1', riskStyle.text, riskStyle.bg)}>
                          {risk}
                        </Badge>
                      )}
                    </div>

                    {/* Retreat tag */}
                    {conv.retreat_id && (
                      <div className="mt-0.5">
                        <span className="truncate text-[10px] text-muted-foreground/70">
                          {getRetreatLabel(conv.retreat_id)}
                        </span>
                      </div>
                    )}

                    {/* Last message preview */}
                    {conv.last_message_preview && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {conv.last_message_preview}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  {conv.last_message_at && (
                    <span className="shrink-0 text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
