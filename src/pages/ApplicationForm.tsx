import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ScrollMorphHero from '@/components/application/ScrollMorphHero';
import PaceSection from '@/components/application/PaceSection';
import FormHeader from '@/components/application/FormHeader';
import MadLibInput from '@/components/application/MadLibInput';
import MadLibTextarea from '@/components/application/MadLibTextarea';

const TRAINING_DATES = [
  'March 13 - 16, 2026 (Boston, MA)',
  'March 30 - April 2, 2026',
  'June 1 - 4, 2026',
  'July 20 - 23, 2026',
  'August 24 - 27, 2026',
];

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
  { label: 'Ship To', index: 2 },
  { label: 'Emergency', index: 3 },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item) => (
        <label key={item} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
          <Checkbox checked={selected.includes(item)} onCheckedChange={() => toggle(item)} />
          <span className="text-foreground">{item}</span>
        </label>
      ))}
      {onOtherChange !== undefined && (
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 rounded-md border bg-card px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
            <Checkbox
              checked={!!otherValue?.trim()}
              onCheckedChange={(checked) => { if (!checked) onOtherChange(''); }}
              className="mt-0.5"
            />
            <div className="flex-1">
              <span className="text-foreground">Other</span>
              <Input
                placeholder="Please specify…"
                value={otherValue || ''}
                onChange={(e) => onOtherChange(e.target.value)}
                className="mt-1 h-8 text-xs"
              />
            </div>
          </label>
        </div>
      )}
    </div>
  );
}

export default function ApplicationForm() {
  const { retreats, addParticipant, addRegistration } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);

  const activeRetreats = retreats.filter((r) => r.status === 'Open' || r.status === 'Full');

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: keyof FormData, item: string) => {
    const arr = form[key] as string[];
    update(key, arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item] as any);
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
    toast.success(`${fullName}'s application submitted successfully!`);
    setForm(initialFormData);
    setStep(0);
  };

  // Subtle dusk gradient — warms gently across steps
  const duskGradients = [
    'from-[hsl(40,30%,97%)] via-[hsl(30,35%,95%)] to-[hsl(25,30%,93%)]',
    'from-[hsl(30,35%,95%)] via-[hsl(25,30%,93%)] to-[hsl(20,28%,91%)]',
    'from-[hsl(25,28%,93%)] via-[hsl(20,25%,91%)] to-[hsl(15,25%,89%)]',
    'from-[hsl(20,25%,91%)] via-[hsl(330,18%,89%)] to-[hsl(320,15%,87%)]',
    'from-[hsl(330,18%,89%)] via-[hsl(300,12%,87%)] to-[hsl(280,14%,85%)]',
    'from-[hsl(280,14%,85%)] via-[hsl(260,14%,83%)] to-[hsl(240,15%,81%)]',
    'from-[hsl(250,16%,82%)] via-[hsl(235,18%,78%)] to-[hsl(225,20%,75%)]',
    'from-[hsl(20,25%,91%)] via-[hsl(330,18%,89%)] to-[hsl(320,15%,87%)]',
    'from-[hsl(25,28%,93%)] via-[hsl(20,25%,91%)] to-[hsl(15,25%,89%)]',
    'from-[hsl(250,16%,82%)] via-[hsl(235,18%,78%)] to-[hsl(225,20%,75%)]',
  ];

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <ScrollMorphHero />
      <PaceSection />
      <FormHeader sections={SECTIONS} currentStep={step} onStepChange={setStep} />

      <main className={cn(
        'mx-auto max-w-3xl px-4 py-6 sm:px-6 overflow-hidden bg-gradient-to-b transition-all duration-1000 ease-in-out',
        duskGradients[step]
      )}>
        {/* Form card */}
        <div className="rounded-2xl border bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-sm animate-fade-in">

          {/* 0: About You */}
          {step === 0 && (
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
              <p>
                I'd like to join{' '}
                <span className="inline-block w-64 sm:w-80 align-bottom">
                  <Select value={form.retreatId} onValueChange={(v) => update('retreatId', v)}>
                    <SelectTrigger className="border-none border-b-2 rounded-none bg-transparent text-lg font-bold h-auto py-0.5 px-0 shadow-none focus:ring-0 [&>svg]:ml-2">
                      <SelectValue placeholder="select a retreat" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeRetreats.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.retreatName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="block h-[2px] rounded-full bg-gradient-to-r from-[hsl(160_40%_55%)] via-[hsl(200_60%_60%)] to-[hsl(280_50%_65%)] opacity-50" />
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
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
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

          {/* 2: Ship To */}
          {step === 2 && (
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
              <p className="text-base text-muted-foreground">
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

          {/* 3: Emergency */}
          {step === 3 && (
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
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

          {/* 4: Experience */}
          {step === 4 && (
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
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
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
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
                <p className="mb-3 text-base">Physical symptoms I experience:</p>
                <CheckboxGroup
                  items={PHYSICAL_SYMPTOMS}
                  selected={form.physicalSymptoms}
                  onChange={(v) => update('physicalSymptoms', v)}
                  otherValue={form.physicalSymptomsOther}
                  onOtherChange={(v) => update('physicalSymptomsOther', v)}
                />
              </div>
              <div>
                <p className="mb-3 text-base">Dietary preferences:</p>
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
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
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
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
              <div>
                <p className="mb-4">My stress level right now is:</p>
                <div className="px-2">
                  <Slider
                    value={form.stressLevel}
                    onValueChange={(v) => update('stressLevel', v)}
                    min={0} max={10} step={1}
                    className="my-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0 — calm</span>
                    <span className="font-bold text-foreground text-2xl">{form.stressLevel[0]}</span>
                    <span>10 — overwhelmed</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-3 text-base">I've experienced:</p>
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
                <p className="mb-3 text-base">Cognitive symptoms I notice:</p>
                <CheckboxGroup
                  items={COGNITIVE_SYMPTOMS}
                  selected={form.cognitiveSymptoms}
                  onChange={(v) => update('cognitiveSymptoms', v)}
                  otherValue={form.cognitiveSymptomsOther}
                  onOtherChange={(v) => update('cognitiveSymptomsOther', v)}
                />
              </div>
              <div>
                <p className="mb-3 text-base">I take the edge off by:</p>
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
            <div className="space-y-8 text-lg sm:text-xl leading-relaxed text-foreground/80">
              <div>
                <p className="mb-3 text-base">How I take care of myself:</p>
                <div className="space-y-2">
                  {SELF_CARE_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-3 rounded-lg border bg-card/80 px-4 py-3 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
                      <input
                        type="radio"
                        name="selfCare"
                        checked={form.selfCare === option}
                        onChange={() => update('selfCare', option)}
                        className="accent-primary"
                      />
                      <span className="text-foreground">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-base">I turn to for support:</p>
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
            <div className="space-y-6 text-lg sm:text-xl leading-relaxed text-foreground/80">
              <p>Almost there! Here's a summary:</p>
              <div className="rounded-lg border bg-secondary/30 p-4 text-sm space-y-2">
                <p><strong>Name:</strong> {form.preferredName || form.firstName} {form.lastName}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Phone:</strong> {form.phone}</p>
                {form.allergies && <p><strong>Allergies:</strong> {form.allergies}</p>}
                {form.dietaryPreferences.length > 0 && (
                  <p><strong>Dietary:</strong> {form.dietaryPreferences.join(', ')}</p>
                )}
                {form.signalHandle && <p><strong>Signal:</strong> {form.signalHandle}</p>}
                {form.trainingGoals && (
                  <p><strong>Goals:</strong> {form.trainingGoals.substring(0, 120)}{form.trainingGoals.length > 120 ? '…' : ''}</p>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-lg border bg-card/80 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Checkbox
                  checked={form.agreeToTerms}
                  onCheckedChange={(v) => update('agreeToTerms', !!v)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I confirm that the information provided is accurate and I consent to it being used for the purpose of supporting me during the training. My personal information will be kept strictly confidential.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={prev}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              {step + 1} of {SECTIONS.length}
            </span>

            {step < SECTIONS.length - 1 ? (
              <Button onClick={next} className="gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-1">
                <Check className="h-4 w-4" /> Submit
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
