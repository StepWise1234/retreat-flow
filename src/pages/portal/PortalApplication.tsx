import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check, ChevronDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useApplication } from '@/hooks/useApplication';
import { cn } from '@/lib/utils';

/* ─── Constants matching Apply page ─── */
const PHYSICAL_SYMPTOMS = [
  'Panic attacks', 'Tension', 'Quick temper/irritability', 'Inadequate Sleep',
  'Body Aches', 'Stomach upset', 'Rapid/racing heart', 'Muscle Tension',
  'Headaches/migraines', 'Fatigue/Dizziness', 'Brain fog',
];

const DIETARY_OPTIONS = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Other Allergy'];

const LIFE_EXPERIENCES = [
  'Recent losses or death', 'Recent fright or shock', 'Chronic illness',
  'Relationship stress', 'Recently divorced/separated',
  'Recent or traumatic surgeries, accidents, injuries', 'Recent job loss',
  'Financial hardship', 'Working more than 40h per week or two jobs',
  'Being a single parent or primary caregiver',
  'Abuse: sexual/physical/emotional/mental',
  'Family history of addiction or mental illness',
  'Substance use/addiction', 'Compulsive behaviours (sex/shopping/internet/gambling)',
];

const COGNITIVE_SYMPTOMS = [
  'Fear of something bad happening', 'Constant feeling of dread',
  'Quick temper/irritability', 'Negative/Intrusive Thoughts',
  'Obsessive/racing thoughts', 'Difficulty concentrating',
  'Confusion', 'Feeling like you are in a dream',
];

const COPING_MECHANISMS = [
  'Having a drink', 'Isolating yourself', 'Being social',
  'Shopping', 'Planning a vacation',
];

const SELF_CARE_OPTIONS = [
  'I make time for myself everyday',
  'I schedule something once a week for myself',
  'I squeeze in when I get time',
  "There's no time for me",
];

const SUPPORT_NETWORK = [
  'Friends', 'Spiritual Groups', 'Professionals', 'Neighbours',
  'Co-workers', 'Family', 'Partner', 'Pets',
];

/* ─── Shared components ─── */

function CheckboxPill({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm cursor-pointer transition-all duration-300 border',
        checked
          ? 'border-[#FF4500] bg-[#FF4500]/8 text-foreground shadow-[0_0_12px_rgba(255,69,0,0.12)]'
          : 'border-foreground/10 bg-foreground/[0.02] text-foreground/60 hover:border-foreground/20 hover:bg-foreground/[0.04]',
      )}
    >
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200',
        checked ? 'border-[#FF4500] bg-[#FF4500]' : 'border-foreground/25',
      )}>
        {checked && <Check className="h-3 w-3 text-white" />}
      </span>
      {label}
    </motion.button>
  );
}

function CheckboxGroup({ items, selected, onChange, otherValue, onOtherChange }: {
  items: string[];
  selected: string[];
  onChange: (items: string[]) => void;
  otherValue?: string;
  onOtherChange?: (v: string) => void;
}) {
  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((i) => i !== item) : [...selected, item]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <CheckboxPill key={item} checked={selected.includes(item)} label={item} onToggle={() => toggle(item)} />
      ))}
      {onOtherChange !== undefined && (
        <div className="w-full mt-2">
          <div className={cn(
            'flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm border transition-all duration-300',
            otherValue?.trim()
              ? 'border-[#FF4500] bg-[#FF4500]/8'
              : 'border-foreground/10 bg-foreground/[0.02]',
          )}>
            <span className="text-foreground/50 shrink-0">Other:</span>
            <input
              placeholder="Please specify…"
              value={otherValue || ''}
              onChange={(e) => onOtherChange(e.target.value)}
              className="bg-transparent border-none outline-none text-foreground placeholder:text-foreground/20 text-sm flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RadioPill({ checked, label, onSelect }: { checked: boolean; label: string; onSelect: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'flex items-center gap-3 rounded-full px-5 py-3 text-sm cursor-pointer transition-all duration-300 border w-full text-left',
        checked
          ? 'border-[#800080] bg-[#800080]/8 text-foreground shadow-[0_0_12px_rgba(128,0,128,0.12)]'
          : 'border-foreground/10 bg-foreground/[0.02] text-foreground/60 hover:border-foreground/20 hover:bg-foreground/[0.04]',
      )}
    >
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
        checked ? 'border-[#800080]' : 'border-foreground/25',
      )}>
        {checked && <span className="h-2 w-2 rounded-full bg-[#800080]" />}
      </span>
      {label}
    </motion.button>
  );
}

function StressSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const percent = (value / 10) * 100;
  const trackColor = value <= 3 ? '#FFA500' : value <= 6 ? '#FF4500' : '#800080';
  return (
    <div className="px-2 py-4">
      <div className="relative h-2 w-full rounded-full bg-foreground/10 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: trackColor, boxShadow: `0 0 12px ${trackColor}40` }}
        />
      </div>
      <input
        type="range" min={0} max={10} step={1} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full -mt-2 relative z-10 opacity-0 h-6 cursor-pointer"
      />
      <div className="relative -mt-6 h-6 pointer-events-none">
        <motion.div
          className="absolute top-0 h-6 w-6 -translate-x-1/2 rounded-full border-2 flex items-center justify-center"
          style={{
            left: `${percent}%`,
            borderColor: trackColor,
            backgroundColor: '#fafafa',
            boxShadow: `0 0 8px ${trackColor}40`,
          }}
          animate={{ left: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span className="text-[8px] font-bold" style={{ color: trackColor }}>{value}</span>
        </motion.div>
      </div>
      <div className="flex justify-between text-sm text-foreground/35 mt-2">
        <span>0 — calm</span>
        <motion.span key={value} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-2xl" style={{ color: trackColor }}>
          {value}
        </motion.span>
        <span>10 — overwhelmed</span>
      </div>
    </div>
  );
}

/* ─── Section accordion ─── */
interface SectionProps {
  title: string;
  color: string;
  icon?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, color, icon, defaultOpen = false, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      className="rounded-xl border border-foreground/[0.06] bg-background/60 backdrop-blur-sm overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-5 text-left hover:bg-foreground/[0.02] transition-colors"
      >
        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        {icon && <span className="text-lg">{icon}</span>}
        <h3 className="text-lg font-semibold tracking-tight text-foreground/80 flex-1">{title}</h3>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-foreground/30" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-6 pb-6 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Field components ─── */
function Field({ label, value, onChange, multiline, full, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  full?: boolean;
  type?: string;
}) {
  const base = "w-full rounded-lg border border-foreground/10 bg-background/80 px-4 py-3 text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/25 focus:border-[#FFA500]/40 transition-all text-sm";
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-foreground/45 mb-1.5 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={base} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
}

/* ─── Main component ─── */
export default function PortalApplication() {
  const { application, isLoading, updateApplication } = useApplication();
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setForm({
        // About You
        preferred_name: application.preferred_name || '',
        first_name: application.first_name || '',
        last_name: application.last_name || '',
        birth_month: application.birth_month || '',
        birth_day: application.birth_day || '',
        birth_year: application.birth_year || '',
        // Contact
        phone: application.phone || '',
        email: application.email || '',
        signal_handle: application.signal_handle || '',
        // Address
        street_address: application.street_address || '',
        street_address_2: application.street_address_2 || '',
        city: application.city || '',
        state_province: application.state_province || '',
        postal_code: application.postal_code || '',
        country: application.country || '',
        // Emergency
        emergency_first_name: application.emergency_first_name || '',
        emergency_last_name: application.emergency_last_name || '',
        emergency_phone: application.emergency_phone || '',
        // Experience
        journey_work_experience: application.journey_work_experience || '',
        medicine_experience: application.medicine_experience || '',
        serving_experience: application.serving_experience || '',
        life_circumstances: application.life_circumstances || '',
        integration_support: application.integration_support || '',
        // Physical
        physical_health_issues: application.physical_health_issues || '',
        physical_medications: application.physical_medications || '',
        supplements: application.supplements || '',
        allergies: application.allergies || '',
        physical_symptoms: Array.isArray(application.physical_symptoms) ? application.physical_symptoms : [],
        physical_symptoms_other: application.physical_symptoms_other || '',
        dietary_preferences: Array.isArray(application.dietary_preferences) ? application.dietary_preferences : [],
        dietary_other: application.dietary_other || '',
        // Mental
        dsm_diagnosis: application.dsm_diagnosis || '',
        mental_health_issues: application.mental_health_issues || '',
        psych_medications: application.psych_medications || '',
        recreational_drug_use: application.recreational_drug_use || '',
        suicide_consideration: application.suicide_consideration || '',
        mental_health_professional: application.mental_health_professional || '',
        // Stress
        stress_level: application.stress_level ?? 5,
        life_experiences: Array.isArray(application.life_experiences) ? application.life_experiences : [],
        stress_sources: application.stress_sources || '',
        cognitive_symptoms: Array.isArray(application.cognitive_symptoms) ? application.cognitive_symptoms : [],
        cognitive_symptoms_other: application.cognitive_symptoms_other || '',
        coping_mechanisms: Array.isArray(application.coping_mechanisms) ? application.coping_mechanisms : [],
        coping_other: application.coping_other || '',
        trauma_details: application.trauma_details || '',
        // Self-Care
        self_care: application.self_care || '',
        self_care_other: application.self_care_other || '',
        support_network: Array.isArray(application.support_network) ? application.support_network : [],
        support_other: application.support_other || '',
        strengths_hobbies: application.strengths_hobbies || '',
        training_goals: application.training_goals || '',
        anything_else: application.anything_else || '',
      });
    }
  }, [application]);

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

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
    <div className="space-y-6">
      {/* Header + Save */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground/85">
            Your Application
          </h1>
          <p className="mt-1 text-foreground/45">
            Review and update any information you've submitted.
          </p>
        </div>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white text-sm transition-all disabled:opacity-50 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)',
          }}
        >
          {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </motion.button>
      </div>

      {/* Sections */}
      <Section title="About You" color="#FFA500" icon="👋" defaultOpen>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" value={form.first_name || ''} onChange={(v) => update('first_name', v)} />
          <Field label="Last Name" value={form.last_name || ''} onChange={(v) => update('last_name', v)} />
          <Field label="Preferred Name" value={form.preferred_name || ''} onChange={(v) => update('preferred_name', v)} />
          <div className="flex gap-2">
            <Field label="Birth Month" value={form.birth_month || ''} onChange={(v) => update('birth_month', v)} />
            <Field label="Day" value={form.birth_day || ''} onChange={(v) => update('birth_day', v)} />
            <Field label="Year" value={form.birth_year || ''} onChange={(v) => update('birth_year', v)} />
          </div>
        </div>
      </Section>

      <Section title="Contact" color="#FF4500" icon="📱">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" value={form.email || ''} onChange={(v) => update('email', v)} type="email" />
          <Field label="Phone" value={form.phone || ''} onChange={(v) => update('phone', v)} type="tel" />
          <Field label="Signal Handle" value={form.signal_handle || ''} onChange={(v) => update('signal_handle', v)} />
        </div>
      </Section>

      <Section title="Address" color="#800080" icon="🏠">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Street Address" value={form.street_address || ''} onChange={(v) => update('street_address', v)} full />
          <Field label="Apt / Suite" value={form.street_address_2 || ''} onChange={(v) => update('street_address_2', v)} full />
          <Field label="City" value={form.city || ''} onChange={(v) => update('city', v)} />
          <Field label="State / Province" value={form.state_province || ''} onChange={(v) => update('state_province', v)} />
          <Field label="Postal Code" value={form.postal_code || ''} onChange={(v) => update('postal_code', v)} />
          <Field label="Country" value={form.country || ''} onChange={(v) => update('country', v)} />
        </div>
      </Section>

      <Section title="Emergency Contact" color="#FFA500" icon="🚨">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First Name" value={form.emergency_first_name || ''} onChange={(v) => update('emergency_first_name', v)} />
          <Field label="Last Name" value={form.emergency_last_name || ''} onChange={(v) => update('emergency_last_name', v)} />
          <Field label="Phone" value={form.emergency_phone || ''} onChange={(v) => update('emergency_phone', v)} type="tel" />
        </div>
      </Section>

      <Section title="Experience & Background" color="#FF4500" icon="🧭">
        <div className="grid gap-4 sm:grid-cols-1">
          <Field label="Journey Work Experience" value={form.journey_work_experience || ''} onChange={(v) => update('journey_work_experience', v)} multiline full />
          <Field label="Medicine Experience" value={form.medicine_experience || ''} onChange={(v) => update('medicine_experience', v)} multiline full />
          <Field label="Serving Experience" value={form.serving_experience || ''} onChange={(v) => update('serving_experience', v)} multiline full />
          <Field label="Life Circumstances" value={form.life_circumstances || ''} onChange={(v) => update('life_circumstances', v)} multiline full />
          <Field label="Integration Support" value={form.integration_support || ''} onChange={(v) => update('integration_support', v)} multiline full />
        </div>
      </Section>

      <Section title="My Body" color="#800080" icon="🫀">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-1">
            <Field label="Physical Health Issues" value={form.physical_health_issues || ''} onChange={(v) => update('physical_health_issues', v)} multiline full />
            <Field label="Prescriptions & Reason" value={form.physical_medications || ''} onChange={(v) => update('physical_medications', v)} multiline full />
            <Field label="Supplements" value={form.supplements || ''} onChange={(v) => update('supplements', v)} multiline full />
            <Field label="Allergies" value={form.allergies || ''} onChange={(v) => update('allergies', v)} multiline full />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">Physical Symptoms</p>
            <CheckboxGroup
              items={PHYSICAL_SYMPTOMS}
              selected={form.physical_symptoms || []}
              onChange={(v) => update('physical_symptoms', v)}
              otherValue={form.physical_symptoms_other}
              onOtherChange={(v) => update('physical_symptoms_other', v)}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">Dietary Preferences</p>
            <CheckboxGroup
              items={DIETARY_OPTIONS}
              selected={form.dietary_preferences || []}
              onChange={(v) => update('dietary_preferences', v)}
              otherValue={form.dietary_other}
              onOtherChange={(v) => update('dietary_other', v)}
            />
          </div>
        </div>
      </Section>

      <Section title="My Mind" color="#FFA500" icon="🧠">
        <div className="grid gap-4 sm:grid-cols-1">
          <Field label="Mental Health Diagnoses" value={form.dsm_diagnosis || ''} onChange={(v) => update('dsm_diagnosis', v)} multiline full />
          <Field label="Current Mental Health Concerns" value={form.mental_health_issues || ''} onChange={(v) => update('mental_health_issues', v)} multiline full />
          <Field label="Psychiatric Medications" value={form.psych_medications || ''} onChange={(v) => update('psych_medications', v)} multiline full />
          <Field label="Recreational / Stimulant Use" value={form.recreational_drug_use || ''} onChange={(v) => update('recreational_drug_use', v)} multiline full />
          <Field label="Suicide Consideration" value={form.suicide_consideration || ''} onChange={(v) => update('suicide_consideration', v)} multiline full />
          <Field label="Mental Health Professional" value={form.mental_health_professional || ''} onChange={(v) => update('mental_health_professional', v)} multiline full />
        </div>
      </Section>

      <Section title="Stress & Coping" color="#FF4500" icon="🌊">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">Stress Level</p>
            <StressSlider value={form.stress_level ?? 5} onChange={(v) => update('stress_level', v)} />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">Life Experiences</p>
            <CheckboxGroup
              items={LIFE_EXPERIENCES}
              selected={form.life_experiences || []}
              onChange={(v) => update('life_experiences', v)}
            />
          </div>
          <Field label="Biggest Source of Stress" value={form.stress_sources || ''} onChange={(v) => update('stress_sources', v)} multiline full />
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">Cognitive Symptoms</p>
            <CheckboxGroup
              items={COGNITIVE_SYMPTOMS}
              selected={form.cognitive_symptoms || []}
              onChange={(v) => update('cognitive_symptoms', v)}
              otherValue={form.cognitive_symptoms_other}
              onOtherChange={(v) => update('cognitive_symptoms_other', v)}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">I Take the Edge Off By</p>
            <CheckboxGroup
              items={COPING_MECHANISMS}
              selected={form.coping_mechanisms || []}
              onChange={(v) => update('coping_mechanisms', v)}
              otherValue={form.coping_other}
              onOtherChange={(v) => update('coping_other', v)}
            />
          </div>
          <Field label="Trauma / Stress History" value={form.trauma_details || ''} onChange={(v) => update('trauma_details', v)} multiline full />
        </div>
      </Section>

      <Section title="Self-Care & Goals" color="#800080" icon="✨">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">How I Take Care of Myself</p>
            <div className="space-y-2">
              {SELF_CARE_OPTIONS.map((option) => (
                <RadioPill key={option} checked={form.self_care === option} label={option} onSelect={() => update('self_care', option)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground/45 mb-2 uppercase tracking-wider">I Turn To For Support</p>
            <CheckboxGroup
              items={SUPPORT_NETWORK}
              selected={form.support_network || []}
              onChange={(v) => update('support_network', v)}
              otherValue={form.support_other}
              onOtherChange={(v) => update('support_other', v)}
            />
          </div>
          <Field label="Strengths & Hobbies" value={form.strengths_hobbies || ''} onChange={(v) => update('strengths_hobbies', v)} multiline full />
          <Field label="Training Goals" value={form.training_goals || ''} onChange={(v) => update('training_goals', v)} multiline full />
          <Field label="Anything Else" value={form.anything_else || ''} onChange={(v) => update('anything_else', v)} multiline full />
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end pt-2 pb-8">
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white text-sm transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #FFA500, #FF4500)',
            boxShadow: '0 4px 14px rgba(255, 69, 0, 0.2)',
          }}
        >
          {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save All Changes'}
        </motion.button>
      </div>
    </div>
  );
}
