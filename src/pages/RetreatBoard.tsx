import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, ChevronLeft, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PIPELINE_STAGES, PipelineStage, STAGE_STYLE_MAP, STATUS_STYLES, getEnrolledCount, getStageIndex, isEnrolledStage } from '@/lib/types';
import Layout from '@/components/Layout';
import ParticipantCard from '@/components/ParticipantCard';
import ParticipantDetailSheet from '@/components/ParticipantDetailSheet';
import QuickAddLeadDialog from '@/components/QuickAddLeadDialog';
import CapacityBanner from '@/components/CapacityBanner';
import BoardFilters, { BoardFilter, BoardSort } from '@/components/BoardFilters';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function RetreatBoard() {
  const { id } = useParams<{ id: string }>();
  const { getRetreat, getRegistrationsForRetreat, getParticipant, moveStage } = useApp();
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoardFilter[]>([]);
  const [sort, setSort] = useState<BoardSort>('stage');

  const retreat = getRetreat(id!);
  const allRegs = getRegistrationsForRetreat(id!);
  const enrolled = getEnrolledCount(allRegs);

  const filteredRegs = useMemo(() => {
    let regs = allRegs;

    // Text search
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

    // Quick filters
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

    // Sorting (applied within each column, but also global for list reference)
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
  }, [search, allRegs, getParticipant, filters, sort]);

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

    // Check backward movement from Payment+ requiring note
    const reg = allRegs.find((r) => r.id === regId);
    if (reg && isEnrolledStage(reg.currentStage) && !isEnrolledStage(newStage)) {
      moveStage(regId, newStage, 'Drag-and-drop (moved backward from enrolled stage)');
    } else {
      moveStage(regId, newStage, 'Drag-and-drop');
    }
  };

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

      {/* Capacity Banner */}
      <CapacityBanner retreat={retreat} registrations={allRegs} />

      {/* Read-only banner */}
      {isReadOnly && (
        <div className="mb-4 rounded-lg border border-border bg-secondary p-3 text-center text-sm text-muted-foreground">
          This retreat is <strong>{retreat.status.toLowerCase()}</strong>. Board is read-only (notes can still be edited).
        </div>
      )}

      {/* Kanban */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {columns.map(({ stage, regs }) => {
            const style = STAGE_STYLE_MAP[stage];
            return (
              <div
                key={stage}
                className="flex w-64 min-w-[240px] flex-shrink-0 flex-col rounded-lg bg-secondary/50"
              >
                {/* Column header */}
                <div className={cn('flex items-center gap-2 rounded-t-lg border-t-2 px-3 py-2.5', style.border)}>
                  <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                  <h3 className="text-xs font-semibold text-foreground">{stage}</h3>
                  <span className="ml-auto rounded-full bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {regs.length}
                  </span>
                </div>

                {/* Cards */}
                <Droppable droppableId={stage} isDropDisabled={isReadOnly}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 space-y-2 p-2 transition-colors min-h-[80px]',
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
                              >
                                <ParticipantCard
                                  registration={reg}
                                  participant={participant}
                                  onClick={() => setSelectedReg(reg.id)}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Detail Sheet */}
      <ParticipantDetailSheet
        registrationId={selectedReg}
        onClose={() => setSelectedReg(null)}
      />
    </Layout>
  );
}
