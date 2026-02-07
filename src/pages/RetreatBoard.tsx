import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, ChevronLeft, Users, LayoutGrid, List, CalendarDays, CheckSquare } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { PIPELINE_STAGES, PipelineStage, STAGE_STYLE_MAP, STATUS_STYLES, getEnrolledCount, isEnrolledStage } from '@/lib/types';
import Layout from '@/components/Layout';
import ParticipantCard from '@/components/ParticipantCard';
import ParticipantDetailSheet from '@/components/ParticipantDetailSheet';
import QuickAddLeadDialog from '@/components/QuickAddLeadDialog';
import CapacityBanner from '@/components/CapacityBanner';
import BoardFilters, { BoardFilter, BoardSort } from '@/components/BoardFilters';
import BulkActionBar from '@/components/bulk/BulkActionBar';
import ListView from '@/components/ListView';
import RetreatCalendar from '@/components/scheduling/RetreatCalendar';
import RetreatTasksView from '@/components/risk/RetreatTasksView';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BoardView = 'kanban' | 'list' | 'calendar' | 'tasks';

export default function RetreatBoard() {
  const { id } = useParams<{ id: string }>();
  const { getRetreat, getRegistrationsForRetreat, getParticipant, moveStage, tasks: allTasks } = useApp();
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoardFilter[]>([]);
  const [sort, setSort] = useState<BoardSort>('stage');
  const [view, setView] = useState<BoardView>('kanban');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const retreat = getRetreat(id!);
  const allRegs = getRegistrationsForRetreat(id!);
  const enrolled = getEnrolledCount(allRegs);
  const retreatTasks = allTasks.filter((t) => t.retreatId === id);

  const filteredRegs = useMemo(() => {
    let regs = allRegs;

    if (search.trim()) {
      const q = search.toLowerCase();
      regs = regs.filter((reg) => {
        const p = getParticipant(reg.participantId);
        if (!p) return false;
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.signalHandle.toLowerCase().includes(q) ||
          reg.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    if (filters.includes('needs-action')) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      regs = regs.filter((r) => new Date(r.lastTouchedAt).getTime() < sevenDaysAgo);
    }
    if (filters.includes('allergies')) {
      regs = regs.filter((r) => {
        const p = getParticipant(r.participantId);
        return p && (p.allergies.trim() || p.specialRequests.trim());
      });
    }
    if (filters.includes('payment-pending')) {
      regs = regs.filter((r) =>
        isEnrolledStage(r.currentStage) && (r.paymentStatus === 'Unpaid' || r.paymentStatus === 'Partial')
      );
    }
    if (filters.includes('interview-week')) {
      regs = regs.filter((r) => r.currentStage === 'Interview');
    }
    if (filters.includes('high-risk')) {
      regs = regs.filter((r) => r.riskLevel === 'High');
    }
    if (filters.includes('has-flags')) {
      regs = regs.filter((r) => r.careFlags.length > 0);
    }
    if (filters.includes('overdue-tasks')) {
      const regIdsWithOverdue = new Set(
        retreatTasks
          .filter((t) => t.status !== 'Done' && isPast(parseISO(t.dueDate)))
          .map((t) => t.registrationId)
      );
      regs = regs.filter((r) => regIdsWithOverdue.has(r.id));
    }

    if (sort === 'lastTouched') {
      regs = [...regs].sort((a, b) => new Date(b.lastTouchedAt).getTime() - new Date(a.lastTouchedAt).getTime());
    } else if (sort === 'name') {
      regs = [...regs].sort((a, b) => {
        const pa = getParticipant(a.participantId);
        const pb = getParticipant(b.participantId);
        return (pa?.fullName ?? '').localeCompare(pb?.fullName ?? '');
      });
    }

    return regs;
  }, [search, allRegs, getParticipant, filters, sort, retreatTasks]);

  const columns = useMemo(() => {
    return PIPELINE_STAGES.map((stage) => ({
      stage,
      regs: filteredRegs.filter((r) => r.currentStage === stage),
    }));
  }, [filteredRegs]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStage = result.destination.droppableId as PipelineStage;
    const regId = result.draggableId;
    const reg = allRegs.find((r) => r.id === regId);
    if (reg && isEnrolledStage(reg.currentStage) && !isEnrolledStage(newStage)) {
      moveStage(regId, newStage, 'Drag-and-drop (moved backward from enrolled stage)');
    } else {
      moveStage(regId, newStage, 'Drag-and-drop');
    }
  };

  const toggleSelect = useCallback((regId: string) => {
    setSelectedIds((prev) =>
      prev.includes(regId) ? prev.filter((id) => id !== regId) : [...prev, regId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (selectedIds.length === filteredRegs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegs.map((r) => r.id));
    }
  }, [filteredRegs, selectedIds.length]);

  const isReadOnly = retreat?.status === 'Closed' || retreat?.status === 'Archived';

  if (!retreat) {
    return (
      <Layout>
        <p className="py-12 text-center text-muted-foreground">Retreat not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{retreat.retreatName}</h1>
              <Badge className={cn('text-xs', STATUS_STYLES[retreat.status])}>
                {retreat.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {retreat.location} · <Users className="inline h-3 w-3" /> {enrolled}/{retreat.cohortSizeTarget} enrolled · {allRegs.length} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search participants…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 pl-8 text-sm"
            />
          </div>
          <BoardFilters
            activeFilters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
          />
          {!isReadOnly && <QuickAddLeadDialog retreatId={retreat.id} />}
        </div>
      </div>

      {/* View tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-md border bg-secondary/50 p-0.5 w-fit">
        {([
          { key: 'kanban', icon: LayoutGrid, label: 'Board' },
          { key: 'list', icon: List, label: 'List' },
          { key: 'calendar', icon: CalendarDays, label: 'Calendar' },
          { key: 'tasks', icon: CheckSquare, label: 'Tasks' },
        ] as const).map(({ key, icon: Icon, label }) => (
          <Button
            key={key}
            variant={view === key ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => { setView(key); setSelectMode(key === 'list'); }}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Capacity Banner */}
      <CapacityBanner retreat={retreat} registrations={allRegs} />

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="mb-4 rounded-lg border border-border bg-secondary p-3 text-center text-sm text-muted-foreground">
          This retreat is <strong>{retreat.status.toLowerCase()}</strong>. Board is read-only (notes can still be edited).
        </div>
      )}

      {/* Kanban */}
      {view === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col gap-4 pb-4">
            {columns.map(({ stage, regs }) => {
              const style = STAGE_STYLE_MAP[stage];
              return (
                <div key={stage} className="rounded-lg bg-secondary/50">
                  <div className={cn('flex items-center gap-2 rounded-t-lg border-l-4 px-4 py-2.5', style.border)}>
                    <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                    <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
                    <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {regs.length}
                    </span>
                  </div>
                  <Droppable droppableId={stage} isDropDisabled={isReadOnly} direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex flex-wrap gap-3 p-3 transition-colors min-h-[60px]',
                          snapshot.isDraggingOver && 'bg-primary/5 rounded-b-lg'
                        )}
                      >
                        {regs.map((reg, index) => {
                          const participant = getParticipant(reg.participantId);
                          if (!participant) return null;
                          return (
                            <Draggable key={reg.id} draggableId={reg.id} index={index} isDragDisabled={isReadOnly}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="w-64 flex-shrink-0"
                                >
                                  <ParticipantCard
                                    registration={reg}
                                    participant={participant}
                                    onClick={() => setSelectedReg(reg.id)}
                                    isDragging={snapshot.isDragging}
                                    selectable={selectMode}
                                    selected={selectedIds.includes(reg.id)}
                                    onToggleSelect={() => toggleSelect(reg.id)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {regs.length === 0 && (
                          <p className="text-xs text-muted-foreground italic py-2">No participants in this stage</p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* List view */}
      {view === 'list' && (
        <ListView
          registrations={filteredRegs}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onOpenDetail={(regId) => setSelectedReg(regId)}
        />
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <RetreatCalendar retreatId={retreat.id} />
      )}

      {/* Tasks view */}
      {view === 'tasks' && (
        <RetreatTasksView retreatId={retreat.id} />
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        retreatId={retreat.id}
        onClear={() => setSelectedIds([])}
      />

      {/* Detail Sheet */}
      <ParticipantDetailSheet
        registrationId={selectedReg}
        onClose={() => setSelectedReg(null)}
      />
    </Layout>
  );
}
