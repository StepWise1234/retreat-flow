import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useApplication } from '@/hooks/useApplication';

interface FieldGroupProps {
  label: string;
  color: string;
  children: React.ReactNode;
}

function FieldGroup({ label, color, children }: FieldGroupProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h3 className="text-lg font-semibold tracking-tight text-foreground/75">{label}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, multiline, full }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  full?: boolean;
}) {
  const base = "w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25 focus:border-[#FFA500]/40 transition-all text-sm";
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-foreground/45 mb-1.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className={base} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
}

export default function PortalApplication() {
  const { application, isLoading, updateApplication } = useApplication();
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setForm({
        preferred_name: application.preferred_name || '',
        first_name: application.first_name || '',
        last_name: application.last_name || '',
        phone: application.phone || '',
        email: application.email || '',
        signal_handle: application.signal_handle || '',
        street_address: application.street_address || '',
        city: application.city || '',
        state_province: application.state_province || '',
        postal_code: application.postal_code || '',
        country: application.country || '',
        emergency_first_name: application.emergency_first_name || '',
        emergency_last_name: application.emergency_last_name || '',
        emergency_phone: application.emergency_phone || '',
        journey_work_experience: application.journey_work_experience || '',
        medicine_experience: application.medicine_experience || '',
        life_circumstances: application.life_circumstances || '',
        training_goals: application.training_goals || '',
        anything_else: application.anything_else || '',
      });
    }
  }, [application]);

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateApplication.mutateAsync(form);
      toast.success('Application updated');
    } catch {
      toast.error('Failed to save changes');
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="text-center py-20 text-foreground/40">Loading your application…</div>;
  }

  if (!application) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-xl text-foreground/60">No application found</p>
        <p className="text-foreground/40">Your application will appear here once it has been submitted and linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
            Your Application
          </h1>
          <p className="mt-1 text-foreground/45">
            Review and update the information you submitted.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white text-sm transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)',
          }}
        >
          {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </motion.button>
      </div>

      <div className="space-y-10 rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm p-6 sm:p-8">
        <FieldGroup label="About You" color="#FFA500">
          <Field label="Preferred Name" value={form.preferred_name || ''} onChange={(v) => update('preferred_name', v)} />
          <Field label="First Name" value={form.first_name || ''} onChange={(v) => update('first_name', v)} />
          <Field label="Last Name" value={form.last_name || ''} onChange={(v) => update('last_name', v)} />
        </FieldGroup>

        <FieldGroup label="Contact" color="#FF4500">
          <Field label="Email" value={form.email || ''} onChange={(v) => update('email', v)} />
          <Field label="Phone" value={form.phone || ''} onChange={(v) => update('phone', v)} />
          <Field label="Signal Handle" value={form.signal_handle || ''} onChange={(v) => update('signal_handle', v)} />
        </FieldGroup>

        <FieldGroup label="Address" color="#800080">
          <Field label="Street Address" value={form.street_address || ''} onChange={(v) => update('street_address', v)} full />
          <Field label="City" value={form.city || ''} onChange={(v) => update('city', v)} />
          <Field label="State / Province" value={form.state_province || ''} onChange={(v) => update('state_province', v)} />
          <Field label="Postal Code" value={form.postal_code || ''} onChange={(v) => update('postal_code', v)} />
          <Field label="Country" value={form.country || ''} onChange={(v) => update('country', v)} />
        </FieldGroup>

        <FieldGroup label="Emergency Contact" color="#FFA500">
          <Field label="First Name" value={form.emergency_first_name || ''} onChange={(v) => update('emergency_first_name', v)} />
          <Field label="Last Name" value={form.emergency_last_name || ''} onChange={(v) => update('emergency_last_name', v)} />
          <Field label="Phone" value={form.emergency_phone || ''} onChange={(v) => update('emergency_phone', v)} />
        </FieldGroup>

        <FieldGroup label="Experience & Goals" color="#FF4500">
          <Field label="Journey Work Experience" value={form.journey_work_experience || ''} onChange={(v) => update('journey_work_experience', v)} multiline full />
          <Field label="Medicine Experience" value={form.medicine_experience || ''} onChange={(v) => update('medicine_experience', v)} multiline full />
          <Field label="Life Circumstances" value={form.life_circumstances || ''} onChange={(v) => update('life_circumstances', v)} multiline full />
          <Field label="Training Goals" value={form.training_goals || ''} onChange={(v) => update('training_goals', v)} multiline full />
          <Field label="Anything Else" value={form.anything_else || ''} onChange={(v) => update('anything_else', v)} multiline full />
        </FieldGroup>
      </div>
    </div>
  );
}
