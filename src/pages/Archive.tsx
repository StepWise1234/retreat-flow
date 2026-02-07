import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import RetreatCard from '@/components/RetreatCard';
import { Input } from '@/components/ui/input';
import { Search, Archive as ArchiveIcon, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_STYLES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Archive() {
  const { retreats, registrations, participants, getRegistrationsForParticipant, getRetreat } = useApp();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'retreats' | 'participants'>('retreats');

  const archivedRetreats = useMemo(() => {
    const past = retreats.filter((r) => r.status === 'Closed' || r.status === 'Archived');
    if (!search.trim()) return past;
    const q = search.toLowerCase();
    return past.filter(
      (r) =>
        r.retreatName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
    );
  }, [retreats, search]);

  const filteredParticipants = useMemo(() => {
    if (!search.trim()) return participants;
    const q = search.toLowerCase();
    return participants.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.signalHandle.toLowerCase().includes(q)
    );
  }, [participants, search]);

  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ArchiveIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Archive & History</h1>
            <p className="text-sm text-muted-foreground">
              Browse past retreats and participant history.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex items-center gap-4 border-b">
          <button
            onClick={() => setTab('retreats')}
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2',
              tab === 'retreats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            Past Retreats
          </button>
          <button
            onClick={() => setTab('participants')}
            className={cn(
              'pb-2 text-sm font-medium transition-colors border-b-2',
              tab === 'participants'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            All Participants
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={tab === 'retreats' ? 'Search past retreats…' : 'Search participants…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content */}
        {tab === 'retreats' && (
          <>
            {archivedRetreats.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ArchiveIcon className="mx-auto mb-3 h-10 w-10" />
                <p>No archived retreats yet.</p>
                <p className="text-xs mt-1">Closed and archived retreats will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {archivedRetreats.map((retreat) => (
                  <RetreatCard
                    key={retreat.id}
                    retreat={retreat}
                    registrations={registrations.filter((r) => r.retreatId === retreat.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'participants' && (
          <div className="space-y-2">
            {filteredParticipants.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <User className="mx-auto mb-3 h-10 w-10" />
                <p>No participants found.</p>
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const pRegs = getRegistrationsForParticipant(p.id);
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{p.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.email} · {p.signalHandle}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {pRegs.map((reg) => {
                          const retreat = getRetreat(reg.retreatId);
                          if (!retreat) return null;
                          return (
                            <Link
                              key={reg.id}
                              to={`/retreat/${retreat.id}`}
                              className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground hover:bg-secondary/80"
                            >
                              {retreat.retreatName.length > 25 ? retreat.retreatName.slice(0, 25) + '…' : retreat.retreatName}
                              <span className="text-muted-foreground">({reg.currentStage})</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap ml-3">
                      <p>{pRegs.length} retreat{pRegs.length !== 1 ? 's' : ''}</p>
                      <p>Joined {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
