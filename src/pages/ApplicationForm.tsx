import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import PaceSection from '@/components/application/PaceSection';
import ProblemSection from '@/components/application/ProblemSection';
import OrbitalSection from '@/components/application/OrbitalSection';
import FormHeader from '@/components/application/FormHeader';
import MadLibInput from '@/components/application/MadLibInput';
import MadLibTextarea from '@/components/application/MadLibTextarea';
import { SparklesCore } from '@/components/ui/sparkles';

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

const SECTIONS = [
  { label: 'About You', index: 0 },
  { label: 'Reach Me', index: 1 },
  { label: 'Emergency', index: 2 },
  { label: 'Ship To', index: 3 },
  { label: 'Experience', index: 4 },
  { label: 'My Body', index: 5 },
  { label: 'My Mind', index: 6 },
  { label: 'Stress', index: 7 },
  { label: 'Self-Care', index: 8 },
  { label: 'Confirm', index: 9 },
];

interface FormData {
  interestedDates: string[];
  preferredName: string;
  firstName: string;
  lastName: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  streetAddress: string;
  streetAddress2: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  signalHandle: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  journeyWorkExperience: string;
  medicineExperience: string;
  servingExperience: string;
  lifeCircumstances: string;
  integrationSupport: string;
  physicalHealthIssues: string;
  physicalMedications: string;
  supplements: string;
  allergies: string;
  physicalSymptoms: string[];
  physicalSymptomsOther: string;
  dietaryPreferences: string[];
  dietaryOther: string;
  dsmDiagnosis: string;
  mentalHealthIssues: string;
  psychMedications: string;
  recreationalDrugUse: string;
  suicideConsideration: string;
  mentalHealthProfessional: string;
  stressLevel: number[];
  lifeExperiences: string[];
  stressSources: string;
  cognitiveSymptoms: string[];
  cognitiveSymptomsOther: string;
  copingMechanisms: string[];
  copingOther: string;
  traumaDetails: string;
  selfCare: string;
  selfCareOther: string;
  supportNetwork: string[];
  supportOther: string;
  strengthsHobbies: string;
  trainingGoals: string;
  anythingElse: string;
  retreatId: string;
  agreeToTerms: boolean;
}

const initialFormData: FormData = {
  interestedDates: [], preferredName: '', firstName: '', lastName: '',
  birthMonth: '', birthDay: '', birthYear: '',
  streetAddress: '', streetAddress2: '', city: '', stateProvince: '', postalCode: '', country: '',
  phone: '', email: '', signalHandle: '',
  emergencyFirstName: '', emergencyLastName: '', emergencyPhone: '',
  journeyWorkExperience: '', medicineExperience: '', servingExperience: '',
  lifeCircumstances: '', integrationSupport: '',
  physicalHealthIssues: '', physicalMedications: '', supplements: '', allergies: '',
  physicalSymptoms: [], physicalSymptomsOther: '',
  dietaryPreferences: [], dietaryOther: '',
  dsmDiagnosis: '', mentalHealthIssues: '', psychMedications: '',
  recreationalDrugUse: '', suicideConsideration: '', mentalHealthProfessional: '',
  stressLevel: [5], lifeExperiences: [], stressSources: '',
  cognitiveSymptoms: [], cognitiveSymptomsOther: '',
  copingMechanisms: [], copingOther: '', traumaDetails: '',
  selfCare: '', selfCareOther: '', supportNetwork: [], supportOther: '',
  strengthsHobbies: '', trainingGoals: '', anythingElse: '',
  retreatId: '', agreeToTerms: false,
};

/* ─── Dark-themed checkbox pill ─── */
function DarkCheckboxPill({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm cursor-pointer transition-all duration-300 border',
        checked
          ? 'border-[hsl(160_40%_55%)] bg-[hsl(160_40%_55%/0.12)] text-white shadow-[0_0_12px_hsl(160_40%_55%/0.2)]'
          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06]',
      )}
    >
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200',
        checked ? 'border-[hsl(160_40%_55%)] bg-[hsl(160_40%_55%)]' : 'border-white/30',
      )}>
        {checked && <Check className="h-3 w-3 text-black" />}
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
        <DarkCheckboxPill key={item} checked={selected.includes(item)} label={item} onToggle={() => toggle(item)} />
      ))}
      {onOtherChange !== undefined && (
        <div className="w-full mt-2">
          <div className={cn(
            'flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm border transition-all duration-300',
            otherValue?.trim()
              ? 'border-[hsl(160_40%_55%)] bg-[hsl(160_40%_55%/0.12)]'
              : 'border-white/10 bg-white/[0.03]',
          )}>
            <span className="text-white/60 shrink-0">Other:</span>
            <input
              placeholder="Please specify…"
              value={otherValue || ''}
              onChange={(e) => onOtherChange(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-white/25 text-sm flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Dark radio pill ─── */
function DarkRadioPill({ checked, label, onSelect }: { checked: boolean; label: string; onSelect: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'flex items-center gap-3 rounded-full px-5 py-3 text-sm cursor-pointer transition-all duration-300 border w-full text-left',
        checked
          ? 'border-[hsl(200_60%_60%)] bg-[hsl(200_60%_60%/0.1)] text-white shadow-[0_0_12px_hsl(200_60%_60%/0.15)]'
          : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06]',
      )}
    >
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
        checked ? 'border-[hsl(200_60%_60%)]' : 'border-white/30',
      )}>
        {checked && <span className="h-2 w-2 rounded-full bg-[hsl(200_60%_60%)]" />}
      </span>
      {label}
    </motion.button>
  );
}

/* ─── Dark stress slider ─── */
function DarkSlider({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  const level = value[0];
  const percent = (level / 10) * 100;
  // Gradient from sage (calm) to warm red (overwhelmed)
  const trackColor = level <= 3
    ? 'hsl(160 40% 55%)'
    : level <= 6
      ? 'hsl(45 90% 60%)'
      : 'hsl(0 72% 55%)';

  return (
    <div className="px-2 py-4">
      <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: trackColor, boxShadow: `0 0 12px ${trackColor}` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={level}
        onChange={(e) => onChange([parseInt(e.target.value)])}
        className="w-full -mt-2 relative z-10 opacity-0 h-6 cursor-pointer"
      />
      {/* Thumb indicator */}
      <div className="relative -mt-6 h-6 pointer-events-none">
        <motion.div
          className="absolute top-0 h-6 w-6 -translate-x-1/2 rounded-full border-2 flex items-center justify-center"
          style={{
            left: `${percent}%`,
            borderColor: trackColor,
            backgroundColor: 'black',
            boxShadow: `0 0 8px ${trackColor}`,
          }}
          animate={{ left: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <span className="text-[8px] font-bold text-white">{level}</span>
        </motion.div>
      </div>
      <div className="flex justify-between text-sm text-white/40 mt-2">
        <span>0 — calm</span>
        <motion.span
          key={level}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-bold text-2xl"
          style={{ color: trackColor }}
        >
          {level}
        </motion.span>
        <span>10 — overwhelmed</span>
      </div>
    </div>
  );
}

/* ─── Page transition wrapper ─── */
const pageVariants = {
  enter: { opacity: 0, y: 24, filter: 'blur(4px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
};

export default function ApplicationForm() {
  const { retreats, addParticipant, addRegistration } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const activeRetreats = retreats.filter((r) => r.status === 'Open' || r.status === 'Full');

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, SECTIONS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (!form.retreatId || !form.firstName.trim() || !form.email.trim()) {
      toast.error('Please fill in all required fields (Name, Email, Retreat)');
      return;
    }
    if (!form.agreeToTerms) {
      toast.error('Please acknowledge the terms to submit');
      return;
    }

    const fullName = [form.preferredName || form.firstName, form.lastName].filter(Boolean).join(' ');
    const participant = addParticipant({
      fullName,
      email: form.email.trim(),
      signalHandle: form.signalHandle.trim(),
      allergies: [form.allergies, form.dietaryPreferences.join(', '), form.dietaryOther].filter(Boolean).join('; '),
      specialRequests: [form.physicalHealthIssues, form.supplements].filter(Boolean).join('; '),
    });

    addRegistration(form.retreatId, participant.id, 'Application');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <PaceSection />
      <ProblemSection />
      <OrbitalSection />

      {submitted ? (
        <section className="relative overflow-hidden bg-black">
          <div className="relative mx-auto max-w-4xl px-6 pt-24 md:pt-36 pb-24 flex flex-col items-center justify-center">
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white text-center z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Thank You!
            </motion.h2>

            {/* Glowing sage line */}
            <div className="relative mt-4 w-full max-w-lg h-px z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(160_30%_72%)] to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(160_30%_72%)] to-transparent blur-sm" />
            </div>

            {/* Sparkles */}
            <div className="relative w-full h-20 mt-0 z-0">
              <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1.5}
                  particleDensity={80}
                  className="w-full h-full"
                  particleColor="#ffffff"
                  speed={2}
                />
              </div>
            </div>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/70 text-center max-w-xl z-10 -mt-4 leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              We'll follow up with you within 72 hrs to schedule an appointment.
            </motion.p>
          </div>
        </section>
      ) : (
        <>
      <FormHeader sections={SECTIONS} currentStep={step} onStepChange={setStep} />

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 sm:p-8"
          >

            {/* 0: About You */}
            {step === 0 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <p>
                  I'd like to join{' '}
                  <span className="inline-block w-64 sm:w-80 align-bottom">
                    <Select value={form.retreatId} onValueChange={(v) => update('retreatId', v)}>
                      <SelectTrigger className="border-none border-b-2 rounded-none bg-transparent text-lg font-bold text-white h-auto py-0.5 px-0 shadow-none focus:ring-0 [&>svg]:ml-2 [&>svg]:text-white/40 justify-center text-center">
                        <SelectValue placeholder="select a retreat" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(0_0%_10%)] border-white/15 text-white">
                        {activeRetreats.map((r) => (
                          <SelectItem key={r.id} value={r.id} className="text-white/80 focus:bg-white/10 focus:text-white">{r.retreatName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="block h-px rounded-full bg-gradient-to-r from-transparent via-[hsl(160_30%_72%)] to-transparent opacity-60" />
                  </span>.
                </p>
                <p>
                  My name is{' '}
                  <MadLibInput value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="first name" className="w-36 sm:w-44" />{' '}
                  <MadLibInput value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="last name" className="w-36 sm:w-44" />
                </p>
                <p>
                  but you can call me{' '}
                  <MadLibInput value={form.preferredName} onChange={(v) => update('preferredName', v)} placeholder="preferred name" className="w-40 sm:w-48" />.
                </p>
                <p>
                  I was born on{' '}
                  <MadLibInput value={form.birthMonth} onChange={(v) => update('birthMonth', v)} placeholder="MM" className="w-14" />{' '}/{' '}
                  <MadLibInput value={form.birthDay} onChange={(v) => update('birthDay', v)} placeholder="DD" className="w-14" />{' '}/{' '}
                  <MadLibInput value={form.birthYear} onChange={(v) => update('birthYear', v)} placeholder="YYYY" className="w-20" />.
                </p>
              </div>
            )}

            {/* 1: Reach Me */}
            {step === 1 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <p>
                  The best way to reach me is{' '}
                  <MadLibInput value={form.email} onChange={(v) => update('email', v)} placeholder="email address" className="w-56 sm:w-72" type="email" />.
                </p>
                <p>
                  You can also call me at{' '}
                  <MadLibInput value={form.phone} onChange={(v) => update('phone', v)} placeholder="phone number" className="w-44 sm:w-52" type="tel" />.
                </p>
                <p>
                  My Signal handle is{' '}
                  <MadLibInput value={form.signalHandle} onChange={(v) => update('signalHandle', v)} placeholder="@handle" className="w-44 sm:w-52" />.
                </p>
              </div>
            )}

            {/* 2: Emergency */}
            {step === 2 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <p>
                  In case of emergency, please contact{' '}
                  <MadLibInput value={form.emergencyFirstName} onChange={(v) => update('emergencyFirstName', v)} placeholder="first name" className="w-36 sm:w-44" />{' '}
                  <MadLibInput value={form.emergencyLastName} onChange={(v) => update('emergencyLastName', v)} placeholder="last name" className="w-36 sm:w-44" />
                </p>
                <p>
                  at{' '}
                  <MadLibInput value={form.emergencyPhone} onChange={(v) => update('emergencyPhone', v)} placeholder="phone number" className="w-44 sm:w-52" type="tel" />.
                </p>
              </div>
            )}

            {/* 3: Ship To */}
            {step === 3 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <p>
                  We'll ship your Student Training Manual before the retreat.
                </p>
                <p>
                  Send it to{' '}
                  <MadLibInput value={form.streetAddress} onChange={(v) => update('streetAddress', v)} placeholder="street address" className="w-full sm:w-80" />
                </p>
                <p>
                  <MadLibInput value={form.streetAddress2} onChange={(v) => update('streetAddress2', v)} placeholder="apt / suite (optional)" className="w-full sm:w-64" />
                </p>
                <p>
                  in{' '}
                  <MadLibInput value={form.city} onChange={(v) => update('city', v)} placeholder="city" className="w-40 sm:w-48" />,{' '}
                  <MadLibInput value={form.stateProvince} onChange={(v) => update('stateProvince', v)} placeholder="state" className="w-28 sm:w-36" />{' '}
                  <MadLibInput value={form.postalCode} onChange={(v) => update('postalCode', v)} placeholder="zip" className="w-24 sm:w-28" />
                </p>
                <p>
                  <MadLibInput value={form.country} onChange={(v) => update('country', v)} placeholder="country" className="w-44 sm:w-52" />.
                </p>
              </div>
            )}

            {/* 4: Experience */}
            {step === 4 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <div>
                  <p className="mb-2">My experience with journey work:</p>
                  <MadLibTextarea value={form.journeyWorkExperience} onChange={(v) => update('journeyWorkExperience', v)} placeholder="Share broadly, no identifying names…" />
                </div>
                <div>
                  <p className="mb-2">My experience with this medicine:</p>
                  <MadLibTextarea value={form.medicineExperience} onChange={(v) => update('medicineExperience', v)} placeholder="Handshake, hug, full-embrace — include numbers…" />
                </div>
                <div>
                  <p className="mb-2">My experience serving others:</p>
                  <MadLibTextarea value={form.servingExperience} onChange={(v) => update('servingExperience', v)} placeholder="How you've supported others…" />
                </div>
                <div>
                  <p className="mb-2">What brought me to this work:</p>
                  <MadLibTextarea value={form.lifeCircumstances} onChange={(v) => update('lifeCircumstances', v)} placeholder="Life circumstances…" />
                </div>
                <div>
                  <p className="mb-2">For integration support, I can reach out to:</p>
                  <MadLibTextarea value={form.integrationSupport} onChange={(v) => update('integrationSupport', v)} placeholder="Who supports you after sessions…" rows={2} />
                </div>
              </div>
            )}

            {/* 5: My Body */}
            {step === 5 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <div>
                  <p className="mb-2">Current physical health issues:</p>
                  <MadLibTextarea value={form.physicalHealthIssues} onChange={(v) => update('physicalHealthIssues', v)} placeholder="Any significant conditions…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Prescriptions I take and why:</p>
                  <MadLibTextarea value={form.physicalMedications} onChange={(v) => update('physicalMedications', v)} placeholder="Medication, reason, dosage…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Supplements I take regularly:</p>
                  <MadLibTextarea value={form.supplements} onChange={(v) => update('supplements', v)} placeholder="Ongoing supplements…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Allergies requiring treatment:</p>
                  <MadLibTextarea value={form.allergies} onChange={(v) => update('allergies', v)} placeholder="Allergies and medications…" rows={2} />
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">Physical symptoms I experience:</p>
                  <CheckboxGroup
                    items={PHYSICAL_SYMPTOMS}
                    selected={form.physicalSymptoms}
                    onChange={(v) => update('physicalSymptoms', v)}
                    otherValue={form.physicalSymptomsOther}
                    onOtherChange={(v) => update('physicalSymptomsOther', v)}
                  />
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">Dietary preferences:</p>
                  <CheckboxGroup
                    items={DIETARY_OPTIONS}
                    selected={form.dietaryPreferences}
                    onChange={(v) => update('dietaryPreferences', v)}
                    otherValue={form.dietaryOther}
                    onOtherChange={(v) => update('dietaryOther', v)}
                  />
                </div>
              </div>
            )}

            {/* 6: My Mind */}
            {step === 6 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <div>
                  <p className="mb-2">Mental health diagnoses:</p>
                  <MadLibTextarea value={form.dsmDiagnosis} onChange={(v) => update('dsmDiagnosis', v)} placeholder="Diagnosis and when it occurred…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Current mental health concerns:</p>
                  <MadLibTextarea value={form.mentalHealthIssues} onChange={(v) => update('mentalHealthIssues', v)} placeholder="Significant issues…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Psychiatric medications I take:</p>
                  <MadLibTextarea value={form.psychMedications} onChange={(v) => update('psychMedications', v)} placeholder="What, why…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Recreational or stimulant use:</p>
                  <MadLibTextarea value={form.recreationalDrugUse} onChange={(v) => update('recreationalDrugUse', v)} placeholder="Type and frequency…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Have you ever considered suicide?</p>
                  <MadLibTextarea value={form.suicideConsideration} onChange={(v) => update('suicideConsideration', v)} placeholder="If yes, briefly describe…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Current mental health professional:</p>
                  <MadLibTextarea value={form.mentalHealthProfessional} onChange={(v) => update('mentalHealthProfessional', v)} placeholder="Type and reason…" rows={2} />
                </div>
              </div>
            )}

            {/* 7: Stress */}
            {step === 7 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <div>
                  <p className="mb-4">My stress level right now is:</p>
                  <DarkSlider value={form.stressLevel} onChange={(v) => update('stressLevel', v)} />
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">I've experienced:</p>
                  <CheckboxGroup
                    items={LIFE_EXPERIENCES}
                    selected={form.lifeExperiences}
                    onChange={(v) => update('lifeExperiences', v)}
                  />
                </div>
                <div>
                  <p className="mb-2">My biggest source of stress right now:</p>
                  <MadLibTextarea value={form.stressSources} onChange={(v) => update('stressSources', v)} placeholder="What weighs on you…" rows={2} />
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">Cognitive symptoms I notice:</p>
                  <CheckboxGroup
                    items={COGNITIVE_SYMPTOMS}
                    selected={form.cognitiveSymptoms}
                    onChange={(v) => update('cognitiveSymptoms', v)}
                    otherValue={form.cognitiveSymptomsOther}
                    onOtherChange={(v) => update('cognitiveSymptomsOther', v)}
                  />
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">I take the edge off by:</p>
                  <CheckboxGroup
                    items={COPING_MECHANISMS}
                    selected={form.copingMechanisms}
                    onChange={(v) => update('copingMechanisms', v)}
                    otherValue={form.copingOther}
                    onOtherChange={(v) => update('copingOther', v)}
                  />
                </div>
                <div>
                  <p className="mb-2">Anything else about stress or trauma history:</p>
                  <MadLibTextarea value={form.traumaDetails} onChange={(v) => update('traumaDetails', v)} placeholder="Anything relevant…" rows={2} />
                </div>
              </div>
            )}

            {/* 8: Self-Care */}
            {step === 8 && (
              <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-white/70">
                <div>
                  <p className="mb-3 text-base text-white/50">How I take care of myself:</p>
                  <div className="space-y-2">
                    {SELF_CARE_OPTIONS.map((option) => (
                      <DarkRadioPill key={option} checked={form.selfCare === option} label={option} onSelect={() => update('selfCare', option)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-base text-white/50">I turn to for support:</p>
                  <CheckboxGroup
                    items={SUPPORT_NETWORK}
                    selected={form.supportNetwork}
                    onChange={(v) => update('supportNetwork', v)}
                    otherValue={form.supportOther}
                    onOtherChange={(v) => update('supportOther', v)}
                  />
                </div>
                <div>
                  <p className="mb-2">For fun and relaxation, I love:</p>
                  <MadLibTextarea value={form.strengthsHobbies} onChange={(v) => update('strengthsHobbies', v)} placeholder="Strengths, hobbies, interests…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">My goals for this training:</p>
                  <MadLibTextarea value={form.trainingGoals} onChange={(v) => update('trainingGoals', v)} placeholder="What you hope to gain…" rows={2} />
                </div>
                <div>
                  <p className="mb-2">Anything else we should know:</p>
                  <MadLibTextarea value={form.anythingElse} onChange={(v) => update('anythingElse', v)} placeholder="So we can support you best…" rows={2} />
                </div>
              </div>
            )}

            {/* 9: Confirm */}
            {step === 9 && (
              <div className="space-y-6 text-lg sm:text-xl leading-relaxed text-white/70">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 text-[hsl(160_40%_55%)]"
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="text-base font-medium">Almost there! Here's a summary:</span>
                </motion.div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70 space-y-2.5">
                  <p><span className="text-white/40">Name:</span> <span className="text-white">{form.preferredName || form.firstName} {form.lastName}</span></p>
                  <p><span className="text-white/40">Email:</span> <span className="text-white">{form.email}</span></p>
                  <p><span className="text-white/40">Phone:</span> <span className="text-white">{form.phone}</span></p>
                  {form.allergies && <p><span className="text-white/40">Allergies:</span> <span className="text-white">{form.allergies}</span></p>}
                  {form.dietaryPreferences.length > 0 && (
                    <p><span className="text-white/40">Dietary:</span> <span className="text-white">{form.dietaryPreferences.join(', ')}</span></p>
                  )}
                  {form.signalHandle && <p><span className="text-white/40">Signal:</span> <span className="text-white">{form.signalHandle}</span></p>}
                  {form.trainingGoals && (
                    <p><span className="text-white/40">Goals:</span> <span className="text-white">{form.trainingGoals.substring(0, 120)}{form.trainingGoals.length > 120 ? '…' : ''}</span></p>
                  )}
                </div>

                <motion.button
                  type="button"
                  onClick={() => update('agreeToTerms', !form.agreeToTerms)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-start gap-3 rounded-xl px-5 py-4 cursor-pointer transition-all duration-300 border w-full text-left',
                    form.agreeToTerms
                      ? 'border-[hsl(160_40%_55%)] bg-[hsl(160_40%_55%/0.08)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                  )}
                >
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200 mt-0.5',
                    form.agreeToTerms ? 'border-[hsl(160_40%_55%)] bg-[hsl(160_40%_55%)]' : 'border-white/30',
                  )}>
                    {form.agreeToTerms && <Check className="h-3.5 w-3.5 text-black" />}
                  </span>
                  <span className="text-sm text-white/60 leading-relaxed">
                    I confirm that the information provided is accurate and I consent to it being used for the purpose of supporting me during the training. My personal information will be kept strictly confidential.
                  </span>
                </motion.button>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-10 pt-8 flex flex-col items-center gap-6">
              {/* Previous link — left aligned */}
              {step > 0 && (
                <button
                  onClick={prev}
                  className="self-start text-white/30 hover:text-white/60 text-sm tracking-wide transition-colors duration-200"
                >
                  ← {SECTIONS[step - 1]?.label}
                </button>
              )}

              {/* Center: Next / Submit button */}
              {step < SECTIONS.length - 1 ? (
                <motion.button
                  onClick={next}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative px-10 py-3.5 rounded-full text-lg font-medium tracking-wide text-white/90 overflow-hidden cursor-pointer transition-all duration-300 border border-white/10 hover:border-[hsl(160_30%_72%/0.4)]"
                >
                  {/* Idle: subtle glass */}
                  <span className="absolute inset-0 rounded-full bg-white/[0.04] transition-opacity duration-300 group-hover:opacity-0" />
                  {/* Hover: sage glow fill */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(160_30%_72%/0.12)] via-[hsl(160_30%_72%/0.18)] to-[hsl(160_30%_72%/0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Glow ring */}
                  <span className="absolute inset-0 rounded-full shadow-[0_0_0_0_hsl(160_30%_72%/0)] group-hover:shadow-[0_0_24px_-4px_hsl(160_30%_72%/0.5)] transition-shadow duration-500" />
                  {/* Sweep on hover */}
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[hsl(160_30%_72%/0.08)] to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    Continue <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative px-10 py-3.5 rounded-full text-lg font-semibold tracking-wide text-black overflow-hidden cursor-pointer transition-all duration-300"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(160_28%_68%)] via-[hsl(160_30%_72%)] to-[hsl(160_28%_68%)]" />
                  <span className="absolute inset-0 rounded-full shadow-[0_0_0_0_hsl(160_30%_72%/0)] group-hover:shadow-[0_0_30px_-4px_hsl(160_30%_72%/0.6)] transition-shadow duration-500" />
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    <Check className="h-5 w-5" /> Submit Application
                  </span>
                </motion.button>
              )}

              {/* Segmented progress bar — matches header */}
              <div className="w-full max-w-xl flex gap-1.5">
                {SECTIONS.map((section, idx) => {
                  const isComplete = idx < step;
                  const isCurrent = idx === step;
                  return (
                    <button
                      key={idx}
                      onClick={() => setStep(idx)}
                      className="group flex-1 py-2 cursor-pointer"
                      aria-label={`Go to ${section.label}`}
                    >
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all duration-500 ease-out',
                          isComplete && 'bg-[hsl(160_30%_72%)]',
                          isCurrent && 'bg-[hsl(160_30%_72%)] shadow-[0_0_14px_hsl(160_30%_72%/0.6)]',
                          !isComplete && !isCurrent && 'bg-white/12 group-hover:bg-white/25',
                        )}
                      />
                      <span className="block mt-1.5 text-[11px] text-center tracking-wide text-white/0 group-hover:text-white/50 transition-colors duration-200 whitespace-nowrap">
                        {section.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
        </>
      )}
    </div>
  );
}
