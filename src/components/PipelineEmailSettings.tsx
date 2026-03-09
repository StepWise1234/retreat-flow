import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Settings, X, Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PipelineEmailTemplate {
  id: string;
  pipeline_stage: string;
  email_subject: string;
  email_body_html: string;
  email_body_text: string | null;
  is_enabled: boolean;
  delay_hours: number;
}

const STAGE_LABELS: Record<string, string> = {
  applied: 'Application Received',
  interview: 'Interview Scheduled',
  approved: 'Approved',
  enrolled: 'Enrolled',
  completed: 'Training Completed',
};

export function PipelineEmailSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['pipeline-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_email_templates')
        .select('*')
        .order('pipeline_stage');
      if (error) throw error;
      return data as PipelineEmailTemplate[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('pipeline_email_templates')
        .update({ is_enabled })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-email-templates'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, email_subject, email_body_html }: { id: string; email_subject: string; email_body_html: string }) => {
      const { error } = await supabase
        .from('pipeline_email_templates')
        .update({ email_subject, email_body_html })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-email-templates'] });
      toast.success('Template updated');
      setEditingTemplate(null);
    },
  });

  const handleToggle = (template: PipelineEmailTemplate) => {
    toggleMutation.mutate({
      id: template.id,
      is_enabled: !template.is_enabled,
    });
    toast.success(template.is_enabled ? 'Email automation disabled' : 'Email automation enabled');
  };

  const handleEdit = (template: PipelineEmailTemplate) => {
    setEditingTemplate(template.id);
    setEditSubject(template.email_subject);
    setEditBody(template.email_body_html);
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    updateMutation.mutate({
      id: editingTemplate,
      email_subject: editSubject,
      email_body_html: editBody,
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Email Automation
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-background shadow-xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Email Automation</h2>
                    <p className="text-sm text-muted-foreground">
                      Toggle automated emails for each pipeline stage
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No email templates found</p>
                    <p className="text-sm text-muted-foreground">Run the database migration to set up templates</p>
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="rounded-lg border bg-card p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              template.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          <div>
                            <h3 className="font-medium">
                              {STAGE_LABELS[template.pipeline_stage] || template.pipeline_stage}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {template.email_subject}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={template.is_enabled}
                          onCheckedChange={() => handleToggle(template)}
                          disabled={toggleMutation.isPending}
                        />
                      </div>

                      {editingTemplate === template.id ? (
                        <div className="space-y-3 pt-3 border-t">
                          <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="body">Body (HTML)</Label>
                            <Textarea
                              id="body"
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              className="mt-1 min-h-[200px] font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Use {'{{first_name}}'}, {'{{training_date}}'} for dynamic content
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View & Edit Template
                        </Button>
                      )}
                    </div>
                  ))
                )}

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 mt-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">Automation Note</p>
                      <p className="text-sm text-amber-600 mt-1">
                        Emails are sent from hello@stepwise.education when a participant moves to the corresponding pipeline stage.
                        Toggle OFF to disable automatic emails for any stage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
