import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, ChevronLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PIPELINE_STAGES, PipelineStage, STAGE_STYLE_MAP } from '@/lib/types';
import Layout from '@/components/Layout';
import ParticipantCard from '@/components/ParticipantCard';
import ParticipantDetailSheet from '@/components/ParticipantDetailSheet';
import QuickAddLeadDialog from '@/components/QuickAddLeadDialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function RetreatBoard() {
  const { id } = useParams<{ id: string }>();
  const { getRetreat, getRegistrationsForRetreat, getParticipant, moveStage } = useApp();
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState<string | null>(null);

  const retreat = getRetreat(id!);
  const allRegs = getRegistrationsForRetreat(id!);

  const filteredRegs = useMemo(() => {
    if (!search.trim()) return allRegs;
    const q = search.toLowerCase();
    return allRegs.filter((reg) => {
      const p = getParticipant(reg.participantId);
      if (!p) return false;
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.signalHandle.toLowerCase().includes(q) ||
        reg.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, allRegs, getParticipant]);

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
    moveStage(regId, newStage, 'Drag-and-drop');
  };

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
            <h1 className="text-xl font-bold text-foreground">{retreat.retreatName}</h1>
            <p className="text-xs text-muted-foreground">
              {retreat.location} · {allRegs.length} participants
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
          <QuickAddLeadDialog retreatId={retreat.id} />
        </div>
      </div>

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
                <Droppable droppableId={stage}>
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
                          <Draggable key={reg.id} draggableId={reg.id} index={index}>
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
