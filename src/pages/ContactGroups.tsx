import { useState, useMemo } from 'react';
import { Copy, Mail, MessageCircle, Users, Filter, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { PIPELINE_STAGES, PipelineStage, STAGE_STYLE_MAP, PaymentStatus, RiskLevel } from '@/lib/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ContactType = 'email' | 'signal';

const PAYMENT_STATUSES: PaymentStatus[] = ['Unpaid', 'Partial', 'Paid', 'Refunded'];
const RISK_LEVELS: RiskLevel[] = ['None', 'Low', 'Medium', 'High'];

export default function ContactGroups() {
  const { retreats, registrations, participants, getParticipant } = useApp();

  const [selectedRetreatId, setSelectedRetreatId] = useState<string>('all');
  const [selectedStages, setSelectedStages] = useState<PipelineStage[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentStatus[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copiedType, setCopiedType] = useState<ContactType | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    registrations.forEach((r) => r.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [registrations]);

  // Filter registrations
  const filteredRegs = useMemo(() => {
    let regs = registrations;

    if (selectedRetreatId !== 'all') {
      regs = regs.filter((r) => r.retreatId === selectedRetreatId);
    }
    if (selectedStages.length > 0) {
      regs = regs.filter((r) => selectedStages.includes(r.currentStage));
    }
    if (selectedPayment.length > 0) {
      regs = regs.filter((r) => selectedPayment.includes(r.paymentStatus));
    }
    if (selectedRisk.length > 0) {
      regs = regs.filter((r) => selectedRisk.includes(r.riskLevel));
    }
    if (selectedTags.length > 0) {
      regs = regs.filter((r) => selectedTags.some((t) => r.tags.includes(t)));
    }

    return regs;
  }, [registrations, selectedRetreatId, selectedStages, selectedPayment, selectedRisk, selectedTags]);

  // Get unique participants from filtered registrations
  const contactList = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; fullName: string; email: string; signalHandle: string; retreatNames: string[] }[] = [];

    filteredRegs.forEach((reg) => {
      const p = getParticipant(reg.participantId);
      if (!p) return;

      if (seen.has(p.id)) {
        // Add retreat name to existing entry
        const existing = result.find((c) => c.id === p.id);
        const retreat = retreats.find((r) => r.id === reg.retreatId);
        if (existing && retreat && !existing.retreatNames.includes(retreat.retreatName)) {
          existing.retreatNames.push(retreat.retreatName);
        }
        return;
      }

      seen.add(p.id);
      const retreat = retreats.find((r) => r.id === reg.retreatId);
      result.push({
        id: p.id,
        fullName: p.fullName,
        email: p.email,
        signalHandle: p.signalHandle,
        retreatNames: retreat ? [retreat.retreatName] : [],
      });
    });

    return result.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [filteredRegs, getParticipant, retreats]);

  const handleCopyAll = async (type: ContactType) => {
    const values = contactList.map((c) => (type === 'email' ? c.email : c.signalHandle)).filter(Boolean);
    if (values.length === 0) {
      toast.error(`No ${type === 'email' ? 'emails' : 'Signal handles'} to copy`);
      return;
    }
    await navigator.clipboard.writeText(values.join(', '));
    setCopiedType(type);
    toast.success(`${values.length} ${type === 'email' ? 'emails' : 'Signal handles'} copied`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopySingle = async (value: string, type: ContactType) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${type === 'email' ? 'Email' : 'Signal handle'} copied`);
  };

  const toggleStage = (stage: PipelineStage) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const togglePayment = (status: PaymentStatus) => {
    setSelectedPayment((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleRisk = (level: RiskLevel) => {
    setSelectedRisk((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedStages([]);
    setSelectedPayment([]);
    setSelectedRisk([]);
    setSelectedTags([]);
  };

  const activeFilterCount = selectedStages.length + selectedPayment.length + selectedRisk.length + selectedTags.length;
  const visibleRetreats = retreats.filter((r) => r.status !== 'Draft');

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contact Groups</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build contact lists by retreat, pipeline stage, and filters. Copy emails or Signal handles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Filters sidebar */}
        <div className="space-y-5">
          {/* Retreat selector */}
          <div className="rounded-lg border bg-gradient-card p-4 space-y-3 hover-border-glow">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Retreat
            </Label>
            <Select value={selectedRetreatId} onValueChange={setSelectedRetreatId}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select retreat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All retreats</SelectItem>
                {visibleRetreats.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.retreatName} ({r.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage filters */}
          <div className="rounded-lg border bg-gradient-card p-4 space-y-3 hover-border-glow">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline Stage
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PIPELINE_STAGES.map((stage) => {
                const style = STAGE_STYLE_MAP[stage];
                const isActive = selectedStages.includes(stage);
                return (
                  <button
                    key={stage}
                    onClick={() => toggleStage(stage)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 border hover-lift',
                      isActive
                        ? `${style.bg} ${style.text} ${style.border} shadow-sm`
                        : `border-transparent hover:${style.bg} hover:${style.text}`,
                      !isActive && 'bg-secondary text-muted-foreground'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={cn('h-2 w-2 rounded-full transition-colors', isActive ? style.dot : 'bg-muted-foreground/30')} />
                      {stage}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment status */}
          <div className="rounded-lg border bg-gradient-card p-4 space-y-3 hover-border-glow">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Payment Status
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_STATUSES.map((status) => {
                const isActive = selectedPayment.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => togglePayment(status)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-all border',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk level */}
          <div className="rounded-lg border bg-gradient-card p-4 space-y-3 hover-border-glow">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Risk Level
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {RISK_LEVELS.map((level) => {
                const isActive = selectedRisk.includes(level);
                return (
                  <button
                    key={level}
                    onClick={() => toggleRisk(level)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-all border',
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="rounded-lg border bg-gradient-card p-4 space-y-3 hover-border-glow">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium transition-all border',
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs w-full">
              Clear all filters ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary + copy actions */}
          <div className="rounded-lg border bg-gradient-card p-4 hover-border-glow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {contactList.length} participant{contactList.length !== 1 ? 's' : ''} matched
                </span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => handleCopyAll('email')}
                  disabled={contactList.length === 0}
                >
                  {copiedType === 'email' ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  Copy all emails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => handleCopyAll('signal')}
                  disabled={contactList.length === 0}
                >
                  {copiedType === 'signal' ? <Check className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
                  Copy all Signal handles
                </Button>
              </div>
            </div>
          </div>

          {/* Contact list */}
          {contactList.length === 0 ? (
            <div className="rounded-lg border bg-gradient-card p-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No participants match your filters. Adjust your selection above.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-gradient-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Email</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Signal</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Retreat(s)</th>
                    <th className="px-4 py-2.5 w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {contactList.map((contact) => (
                    <tr key={contact.id} className="border-b last:border-0 hover:bg-primary/[0.03] transition-colors duration-200">
                      <td className="px-4 py-2.5 font-medium text-foreground">{contact.fullName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{contact.email}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{contact.signalHandle}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {contact.retreatNames.map((name) => (
                            <Badge key={name} variant="secondary" className="text-[10px]">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopySingle(contact.email, 'email')}
                            className="rounded p-1 hover:bg-secondary transition-colors"
                            title="Copy email"
                          >
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleCopySingle(contact.signalHandle, 'signal')}
                            className="rounded p-1 hover:bg-secondary transition-colors"
                            title="Copy Signal handle"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}