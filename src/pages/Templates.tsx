import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { STAGE_STYLE_MAP } from '@/lib/types';
import { toast } from 'sonner';
import { Save, MessageSquareText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Templates() {
  const { templates, updateTemplate } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  const startEdit = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    setEditId(id);
    setEditSubject(t.subject);
    setEditBody(t.body);
  };

  const saveEdit = () => {
    if (!editId) return;
    updateTemplate(editId, editSubject, editBody);
    toast.success('Template saved');
    setEditId(null);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Message Templates</h1>
            <p className="text-sm text-muted-foreground">
              Edit templates used at each pipeline stage. Variables: {'{{fullName}}'}, {'{{retreatName}}'}, {'{{startDate}}'}, {'{{endDate}}'}, {'{{location}}'}, {'{{paymentLink}}'}, etc.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {templates.map((template) => {
            const style = STAGE_STYLE_MAP[template.stage];
            const isEditing = editId === template.id;

            return (
              <div
                key={template.id}
                className="rounded-lg border bg-card overflow-hidden"
              >
                <div className={cn('flex items-center gap-2 border-b px-4 py-2.5', style.bg)}>
                  <span className={cn('h-2 w-2 rounded-full', style.dot)} />
                  <h3 className={cn('text-sm font-semibold', style.text)}>{template.stage}</h3>
                </div>

                {isEditing ? (
                  <div className="space-y-3 p-4">
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Body</Label>
                      <Textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="mt-1 h-40 resize-y font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEdit} className="gap-1">
                        <Save className="h-3.5 w-3.5" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(template.id)}
                    className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{template.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                      {template.body}
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">Click to edit</p>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
