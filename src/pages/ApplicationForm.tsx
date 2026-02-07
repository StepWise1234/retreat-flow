import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/flight-school-hero.png';

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
  { label: 'Basics', index: 0 },
  { label: 'Experience', index: 1 },
  { label: 'Physical Health', index: 2 },
  { label: 'Mental Health', index: 3 },
  { label: 'Wellbeing', index: 4 },
  { label: 'Self-Care', index: 5 },
  { label: 'Confirmation', index: 6 },
];

interface FormData {
  // Section 1
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
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  // Section 2
  journeyWorkExperience: string;
  medicineExperience: string;
  servingExperience: string;
  lifeCircumstances: string;
  integrationSupport: string;
  // Section 3
  physicalHealthIssues: string;
  physicalMedications: string;
  supplements: string;
  allergies: string;
  physicalSymptoms: string[];
  physicalSymptomsOther: string;
  dietaryPreferences: string[];
  dietaryOther: string;
  // Section 4
  dsmDiagnosis: string;
  mentalHealthIssues: string;
  psychMedications: string;
  recreationalDrugUse: string;
  suicideConsideration: string;
  mentalHealthProfessional: string;
  // Section 5
  stressLevel: number[];
  lifeExperiences: string[];
  stressSources: string;
  cognitiveSymptoms: string[];
  cognitiveSymptomsOther: string;
  copingMechanisms: string[];
  copingOther: string;
  traumaDetails: string;
  // Section 6
  selfCare: string;
  selfCareOther: string;
  supportNetwork: string[];
  supportOther: string;
  strengthsHobbies: string;
  trainingGoals: string;
  anythingElse: string;
  // Section 7
  retreatId: string;
  agreeToTerms: boolean;
}

const initialFormData: FormData = {
  interestedDates: [], preferredName: '', firstName: '', lastName: '',
  birthMonth: '', birthDay: '', birthYear: '',
  streetAddress: '', streetAddress2: '', city: '', stateProvince: '', postalCode: '', country: '',
  phone: '', email: '',
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
      signalHandle: '',
      allergies: [form.allergies, form.dietaryPreferences.join(', '), form.dietaryOther].filter(Boolean).join('; '),
      specialRequests: [form.physicalHealthIssues, form.supplements].filter(Boolean).join('; '),
    });

    addRegistration(form.retreatId, participant.id, 'Application');
    toast.success(`${fullName}'s application submitted successfully!`);
    setForm(initialFormData);
    setStep(0);
  };

  // Red → Orange → Amber → Yellow → Lime → Emerald → Green
  const progressColors = [
    { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
    { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', dot: 'bg-yellow-400' },
    { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-300', dot: 'bg-lime-400' },
    { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(330,60%,92%)] via-[hsl(20,80%,90%)] via-60% to-[hsl(210,50%,87%)]">
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Hero header with image */}
        <div className="relative mb-8 overflow-hidden rounded-2xl shadow-lg">
          <img
            src={heroImage}
            alt="View from airplane window above pink clouds at sunset"
            className="h-48 sm:h-56 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] tracking-tight">
              Flight School Application
            </h1>
            <p className="mt-2 text-sm text-white/80 max-w-md drop-shadow">
              We appreciate your interest! Please answer the questions as fully as you can.
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="mb-6 flex items-center justify-center gap-1 overflow-x-auto pb-1">
          {SECTIONS.map((section, idx) => {
            const color = progressColors[idx];
            const isComplete = idx < step;
            const isCurrent = idx === step;
            return (
              <button
                key={idx}
                onClick={() => setStep(idx)}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border whitespace-nowrap shrink-0',
                  isCurrent && `${color.bg} ${color.text} ${color.border}`,
                  isComplete && `${color.dot} text-white border-transparent`,
                  !isCurrent && !isComplete && 'bg-secondary text-muted-foreground border-transparent'
                )}
              >
                {isComplete ? <Check className="h-3 w-3" /> : <span>{idx + 1}</span>}
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm animate-fade-in">

          {/* SECTION 0: Training & Personal Info */}
          {step === 0 && (
            <div className="space-y-6">
              <SectionTitle>Interested Training Date(s)</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRAINING_DATES.map((date) => (
                  <label key={date} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
                    <Checkbox
                      checked={form.interestedDates.includes(date)}
                      onCheckedChange={() => toggleArrayItem('interestedDates', date)}
                    />
                    <span className="text-foreground">{date}</span>
                  </label>
                ))}
              </div>

              <SectionTitle>Name *</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Preferred Name</Label>
                  <Input value={form.preferredName} onChange={(e) => update('preferredName', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">First (Legal) Name *</Label>
                  <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="mt-1" />
                </div>
              </div>

              <SectionTitle>Birth Date *</SectionTitle>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Month</Label>
                  <Input placeholder="MM" value={form.birthMonth} onChange={(e) => update('birthMonth', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Day</Label>
                  <Input placeholder="DD" value={form.birthDay} onChange={(e) => update('birthDay', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Input placeholder="YYYY" value={form.birthYear} onChange={(e) => update('birthYear', e.target.value)} className="mt-1" />
                </div>
              </div>

              <SectionTitle>Address</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">Please give us an address to ship your Student Training Manual for pre-retreat sessions.</p>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Street Address</Label>
                  <Input value={form.streetAddress} onChange={(e) => update('streetAddress', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Street Address Line 2</Label>
                  <Input value={form.streetAddress2} onChange={(e) => update('streetAddress2', e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State / Province</Label>
                    <Input value={form.stateProvince} onChange={(e) => update('stateProvince', e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Postal / Zip Code</Label>
                    <Input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <Input value={form.country} onChange={(e) => update('country', e.target.value)} className="mt-1" placeholder="e.g. United States" />
                  </div>
                </div>
              </div>

              <SectionTitle>Contact *</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1" placeholder="you@example.com" />
                </div>
              </div>

              <SectionTitle>Emergency Contact *</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <Input value={form.emergencyFirstName} onChange={(e) => update('emergencyFirstName', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <Input value={form.emergencyLastName} onChange={(e) => update('emergencyLastName', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input value={form.emergencyPhone} onChange={(e) => update('emergencyPhone', e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: Experience */}
          {step === 1 && (
            <div className="space-y-6">
              <SectionTitle>Do you have previous experience of journey work?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">Please share the broad details without using any identifying terms or names.</p>
              <Textarea value={form.journeyWorkExperience} onChange={(e) => update('journeyWorkExperience', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Do you have previous experience with this medicine?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">List your experience with handshake, hug, and full-embrace; include numbers of experiences.</p>
              <Textarea value={form.medicineExperience} onChange={(e) => update('medicineExperience', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Do you have previous experience serving?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">Please share your service experience in supporting others, without using any identifying terms or names.</p>
              <Textarea value={form.servingExperience} onChange={(e) => update('servingExperience', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Describe any particular life circumstances that brought you to this work:</SectionTitle>
              <Textarea value={form.lifeCircumstances} onChange={(e) => update('lifeCircumstances', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Do you have someone who can you reach out to for help in integrating what you've experienced during your session?</SectionTitle>
              <Textarea value={form.integrationSupport} onChange={(e) => update('integrationSupport', e.target.value)} className="min-h-[80px]" />
            </div>
          )}

          {/* SECTION 2: Physical Health */}
          {step === 2 && (
            <div className="space-y-6">
              <SectionTitle>Please list any current significant physical health issues:</SectionTitle>
              <Textarea value={form.physicalHealthIssues} onChange={(e) => update('physicalHealthIssues', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Are you taking any prescription medication for physical conditions?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">If yes, what kind and reason? Please include dosage(s).</p>
              <Textarea value={form.physicalMedications} onChange={(e) => update('physicalMedications', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Please list supplements that are part of an ongoing regimen:</SectionTitle>
              <Textarea value={form.supplements} onChange={(e) => update('supplements', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Please list any allergies that require regular treatment and medication:</SectionTitle>
              <Textarea value={form.allergies} onChange={(e) => update('allergies', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Which of these physical symptoms do you experience?</SectionTitle>
              <CheckboxGroup
                items={PHYSICAL_SYMPTOMS}
                selected={form.physicalSymptoms}
                onChange={(v) => update('physicalSymptoms', v)}
                otherValue={form.physicalSymptomsOther}
                onOtherChange={(v) => update('physicalSymptomsOther', v)}
              />

              <SectionTitle>Please tell us about your dietary preferences</SectionTitle>
              <CheckboxGroup
                items={DIETARY_OPTIONS}
                selected={form.dietaryPreferences}
                onChange={(v) => update('dietaryPreferences', v)}
                otherValue={form.dietaryOther}
                onOtherChange={(v) => update('dietaryOther', v)}
              />
            </div>
          )}

          {/* SECTION 3: Mental Health */}
          {step === 3 && (
            <div className="space-y-6">
              <SectionTitle>Have you ever been diagnosed with a mental illness or DSM disorder?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">Such as major depression, borderline personality disorder, etc. If so, what was the diagnosis and when did it occur?</p>
              <Textarea value={form.dsmDiagnosis} onChange={(e) => update('dsmDiagnosis', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Please list any current significant mental health issues:</SectionTitle>
              <Textarea value={form.mentalHealthIssues} onChange={(e) => update('mentalHealthIssues', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Are you taking any prescription medication for psychological conditions?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">If yes, what kind and reason?</p>
              <Textarea value={form.psychMedications} onChange={(e) => update('psychMedications', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Please list any stimulant or recreational drug use. Type and frequency:</SectionTitle>
              <Textarea value={form.recreationalDrugUse} onChange={(e) => update('recreationalDrugUse', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Have you ever considered suicide?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">If yes, please briefly describe.</p>
              <Textarea value={form.suicideConsideration} onChange={(e) => update('suicideConsideration', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Are you currently followed by a mental health professional or counsellor?</SectionTitle>
              <p className="text-xs text-muted-foreground -mt-4">If yes, what kind and reason?</p>
              <Textarea value={form.mentalHealthProfessional} onChange={(e) => update('mentalHealthProfessional', e.target.value)} className="min-h-[80px]" />
            </div>
          )}

          {/* SECTION 4: Stress & Wellbeing */}
          {step === 4 && (
            <div className="space-y-6">
              <SectionTitle>I would rate my current stress/anxiety on a scale of 0-10 (10 being high)</SectionTitle>
              <div className="px-2">
                <Slider
                  value={form.stressLevel}
                  onValueChange={(v) => update('stressLevel', v)}
                  min={0} max={10} step={1}
                  className="my-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 (Low)</span>
                  <span className="font-bold text-foreground text-lg">{form.stressLevel[0]}</span>
                  <span>10 (High)</span>
                </div>
              </div>

              <SectionTitle>I have experienced the following:</SectionTitle>
              <CheckboxGroup
                items={LIFE_EXPERIENCES}
                selected={form.lifeExperiences}
                onChange={(v) => update('lifeExperiences', v)}
              />

              <SectionTitle>Please comment on the most current significant source(s) of Stress and Anxiety</SectionTitle>
              <Textarea value={form.stressSources} onChange={(e) => update('stressSources', e.target.value)} className="min-h-[80px]" />

              <SectionTitle>Which of these cognitive symptoms do you experience?</SectionTitle>
              <CheckboxGroup
                items={COGNITIVE_SYMPTOMS}
                selected={form.cognitiveSymptoms}
                onChange={(v) => update('cognitiveSymptoms', v)}
                otherValue={form.cognitiveSymptomsOther}
                onOtherChange={(v) => update('cognitiveSymptomsOther', v)}
              />

              <SectionTitle>Do you take the edge off by:</SectionTitle>
              <CheckboxGroup
                items={COPING_MECHANISMS}
                selected={form.copingMechanisms}
                onChange={(v) => update('copingMechanisms', v)}
                otherValue={form.copingOther}
                onOtherChange={(v) => update('copingOther', v)}
              />

              <SectionTitle>Please provide any further details about your stress/anxiety and trauma history that you feel may be relevant.</SectionTitle>
              <Textarea value={form.traumaDetails} onChange={(e) => update('traumaDetails', e.target.value)} className="min-h-[80px]" />
            </div>
          )}

          {/* SECTION 5: Self-Care & Goals */}
          {step === 5 && (
            <div className="space-y-6">
              <SectionTitle>How do you take care of yourself?</SectionTitle>
              <div className="space-y-2">
                {SELF_CARE_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
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
                <label className="flex items-start gap-2 rounded-md border bg-card px-3 py-2.5 text-sm cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="radio" name="selfCare"
                    checked={form.selfCare === 'Other'}
                    onChange={() => update('selfCare', 'Other')}
                    className="accent-primary mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-foreground">Other</span>
                    {form.selfCare === 'Other' && (
                      <Input value={form.selfCareOther} onChange={(e) => update('selfCareOther', e.target.value)} placeholder="Please specify…" className="mt-1 h-8 text-xs" />
                    )}
                  </div>
                </label>
              </div>

              <SectionTitle>Who do you turn to for support?</SectionTitle>
              <CheckboxGroup
                items={SUPPORT_NETWORK}
                selected={form.supportNetwork}
                onChange={(v) => update('supportNetwork', v)}
                otherValue={form.supportOther}
                onOtherChange={(v) => update('supportOther', v)}
              />

              <SectionTitle>Tell us about your strengths, hobbies, interests. What do you like to do for fun and relaxation?</SectionTitle>
              <Textarea value={form.strengthsHobbies} onChange={(e) => update('strengthsHobbies', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Please describe your goals for joining this training:</SectionTitle>
              <Textarea value={form.trainingGoals} onChange={(e) => update('trainingGoals', e.target.value)} className="min-h-[100px]" />

              <SectionTitle>Anything else you think we should know about you so we can provide you with the best support possible.</SectionTitle>
              <Textarea value={form.anythingElse} onChange={(e) => update('anythingElse', e.target.value)} className="min-h-[80px]" />
            </div>
          )}

          {/* SECTION 6: Confirmation */}
          {step === 6 && (
            <div className="space-y-6">
              <SectionTitle>Assign to Retreat *</SectionTitle>
              <Select value={form.retreatId} onValueChange={(v) => update('retreatId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a retreat" />
                </SelectTrigger>
                <SelectContent>
                  {activeRetreats.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.retreatName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <SectionTitle>Review</SectionTitle>
              <div className="rounded-lg border bg-secondary/30 p-4 text-sm space-y-2">
                <p><strong>Name:</strong> {form.preferredName || form.firstName} {form.lastName}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Phone:</strong> {form.phone}</p>
                {form.interestedDates.length > 0 && (
                  <p><strong>Interested Dates:</strong> {form.interestedDates.join(', ')}</p>
                )}
                {form.allergies && <p><strong>Allergies:</strong> {form.allergies}</p>}
                {form.dietaryPreferences.length > 0 && (
                  <p><strong>Dietary:</strong> {form.dietaryPreferences.join(', ')}</p>
                )}
                <p><strong>Stress Level:</strong> {form.stressLevel[0]}/10</p>
                {form.trainingGoals && (
                  <p><strong>Goals:</strong> {form.trainingGoals.substring(0, 120)}{form.trainingGoals.length > 120 ? '…' : ''}</p>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-md border bg-card px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                <Checkbox
                  checked={form.agreeToTerms}
                  onCheckedChange={(v) => update('agreeToTerms', !!v)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground">
                  I confirm that the information provided is accurate and I consent to it being used for the purpose of supporting me during the training. I understand my personal information will be kept strictly confidential.
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
              Step {step + 1} of {SECTIONS.length}
            </span>

            {step < SECTIONS.length - 1 ? (
              <Button onClick={next} className="gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-1">
                <Check className="h-4 w-4" /> Submit Application
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground border-l-2 border-primary/40 pl-3">{children}</h3>;
}
