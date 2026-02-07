import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check, Send } from 'lucide-react';
import ScrollMorphHero from '@/components/application/ScrollMorphHero';
import PaceSection from '@/components/application/PaceSection';
import FormHeader from '@/components/application/FormHeader';
import InlineField from '@/components/application/InlineField';
import ChipSelector from '@/components/application/ChipSelector';
import PromptTextarea from '@/components/application/PromptTextarea';

/* ── Constants ── */

const TRAINING_DATES = [
  'March 13–16, 2026 · Boston',
  'March 30 – April 2, 2026',
  'June 1–4, 2026',
  'July 20–23, 2026',
  'August 24–27, 2026',
];

const PHYSICAL_SYMPTOMS = [
  'Panic attacks', 'Tension', 'Quick temper', 'Poor sleep',
  'Body aches', 'Stomach upset', 'Racing heart', 'Muscle tension',
  'Headaches', 'Fatigue', 'Brain fog',
];

const DIETARY_OPTIONS = ['Gluten Free', 'Dairy Free', 'Vegetarian', 'Vegan', 'Other Allergy'];

const LIFE_EXPERIENCES = [
  'Recent loss or death', 'Fright or shock', 'Chronic illness',
  'Relationship stress', 'Divorce/separation',
  'Traumatic surgery/accident', 'Job loss',
  'Financial hardship', 'Working 40h+ or two jobs',
  'Single parent/caregiver',
  'Abuse (sexual/physical/emotional)',
  'Family addiction/mental illness',
  'Substance use/addiction', 'Compulsive behaviours',
];

const COGNITIVE_SYMPTOMS = [
  'Fear of something bad', 'Constant dread',
  'Quick temper', 'Intrusive thoughts',
  'Racing thoughts', 'Difficulty concentrating',
  'Confusion', 'Feeling dreamlike',
];

const COPING_MECHANISMS = [
  'Having a drink', 'Isolating', 'Being social',
  'Shopping', 'Planning a vacation',
];

const SELF_CARE_OPTIONS = [
  'I make time for myself every day',
  'I schedule something weekly for me',
  'I squeeze it in when I can',
  "There's no time for me",
];

const SUPPORT_NETWORK = [
  'Friends', 'Spiritual groups', 'Professionals', 'Neighbours',
  'Co-workers', 'Family', 'Partner', 'Pets',
];

/* ── Page definitions ── */

const SECTIONS = [
  { label: 'Hello', index: 0 },
  { label: 'Training', index: 1 },
  { label: 'About You', index: 2 },
  { label: 'Contact', index: 3 },
  { label: 'Experience', index: 4 },
  { label: 'Your Story', index: 5 },
  { label: 'Physical Health', index: 6 },
  { label: 'Symptoms & Diet', index: 7 },
  { label: 'Mental Health', index: 8 },
  { label: 'Stress', index: 9 },
  { label: 'Coping', index: 10 },
  { label: 'Self-Care', index: 11 },
  { label: 'Goals', index: 12 },
  { label: 'Review', index: 13 },
];

/* ── Form data ── */

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

/* ── Shared prose styling ── */

const prose = 'text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-white/85 tracking-tight';
const proseSm = 'text-lg sm:text-xl font-light leading-relaxed text-white/80';
const label = 'text-xs uppercase tracking-widest text-white/30 mb-1 block';

/* ── Page transition ── */

const pageVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

/* ── Component ── */

export default function ApplicationForm() {
  const { retreats, addParticipant, addRegistration } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialFormData);

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
    toast.success(`${fullName}'s application submitted successfully!`);
    setForm(initialFormData);
    setStep(0);
  };

  /* ── Render ── */

  return (
    <div className="min-h-screen bg-black">
      <ScrollMorphHero />
      <PaceSection />

      <FormHeader
        sections={SECTIONS}
        step={step}
        onStepChange={setStep}
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Card container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 sm:p-12 shadow-[0_8px_40px_hsl(0_0%_0%/0.4)] min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ─── PAGE 0: Hello ─── */}
              {step === 0 && (
                <div className="space-y-8">
                  <p className={prose}>
                    Hi there. My name is{' '}
                    <InlineField value={form.firstName} onChange={(v) => update('firstName', v)} placeholder="first name" />
                    {' '}
                    <InlineField value={form.lastName} onChange={(v) => update('lastName', v)} placeholder="last name" />.
                  </p>
                  <p className={prose}>
                    My friends call me{' '}
                    <InlineField value={form.preferredName} onChange={(v) => update('preferredName', v)} placeholder="preferred name" />.
                  </p>
                </div>
              )}

              {/* ─── PAGE 1: Training ─── */}
              {step === 1 && (
                <div className="space-y-8">
                  <p className={prose}>
                    I'm interested in the{' '}
                    <span className="relative inline-block">
                      <select
                        value={form.retreatId}
                        onChange={(e) => update('retreatId', e.target.value)}
                        className="bg-transparent border-0 border-b-2 border-white/20 focus:border-[hsl(160_30%_65%)] outline-none text-white font-normal text-inherit px-1 py-0.5 appearance-none cursor-pointer pr-6 transition-colors duration-300"
                      >
                        <option value="" disabled className="bg-black text-white/50">choose retreat</option>
                        {activeRetreats.map((r) => (
                          <option key={r.id} value={r.id} className="bg-black text-white">{r.retreatName}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none rotate-90" />
                    </span>
                    {' '}training.
                  </p>
                </div>
              )}

              {/* ─── PAGE 2: About You ─── */}
              {step === 2 && (
                <div className="space-y-8">
                  <p className={prose}>
                    I was born on{' '}
                    <InlineField value={form.birthMonth} onChange={(v) => update('birthMonth', v)} placeholder="MM" width="3.5em" />
                    {' / '}
                    <InlineField value={form.birthDay} onChange={(v) => update('birthDay', v)} placeholder="DD" width="3em" />
                    {' / '}
                    <InlineField value={form.birthYear} onChange={(v) => update('birthYear', v)} placeholder="YYYY" width="4.5em" />.
                  </p>

                  <div className="space-y-4">
                    <p className={proseSm}>
                      Please send my Training Manual to:
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <span className={label}>Street Address</span>
                        <input
                          value={form.streetAddress}
                          onChange={(e) => update('streetAddress', e.target.value)}
                          className="conv-input w-full"
                          placeholder="123 Main St"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className={label}>Apt / Suite</span>
                        <input
                          value={form.streetAddress2}
                          onChange={(e) => update('streetAddress2', e.target.value)}
                          className="conv-input w-full"
                          placeholder="Apt 4B (optional)"
                        />
                      </div>
                      <div>
                        <span className={label}>City</span>
                        <input value={form.city} onChange={(e) => update('city', e.target.value)} className="conv-input w-full" />
                      </div>
                      <div>
                        <span className={label}>State / Province</span>
                        <input value={form.stateProvince} onChange={(e) => update('stateProvince', e.target.value)} className="conv-input w-full" />
                      </div>
                      <div>
                        <span className={label}>Postal Code</span>
                        <input value={form.postalCode} onChange={(e) => update('postalCode', e.target.value)} className="conv-input w-full" />
                      </div>
                      <div>
                        <span className={label}>Country</span>
                        <input value={form.country} onChange={(e) => update('country', e.target.value)} className="conv-input w-full" placeholder="United States" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PAGE 3: Contact ─── */}
              {step === 3 && (
                <div className="space-y-8">
                  <p className={prose}>
                    You can reach me at{' '}
                    <InlineField value={form.phone} onChange={(v) => update('phone', v)} placeholder="phone number" />{' '}
                    or email me at{' '}
                    <InlineField value={form.email} onChange={(v) => update('email', v)} placeholder="email address" type="email" />.
                  </p>

                  <p className={proseSm}>
                    My Signal handle is{' '}
                    <InlineField value={form.signalHandle} onChange={(v) => update('signalHandle', v)} placeholder="@handle or number" />.
                  </p>
                  <p className="text-xs text-white/25 -mt-4 italic">We use Signal for secure group communication during retreats.</p>

                  <div className="border-t border-white/[0.06] pt-8">
                    <p className={proseSm}>
                      In case of emergency, please contact{' '}
                      <InlineField value={form.emergencyFirstName} onChange={(v) => update('emergencyFirstName', v)} placeholder="first name" />{' '}
                      <InlineField value={form.emergencyLastName} onChange={(v) => update('emergencyLastName', v)} placeholder="last name" />{' '}
                      at{' '}
                      <InlineField value={form.emergencyPhone} onChange={(v) => update('emergencyPhone', v)} placeholder="phone number" />.
                    </p>
                  </div>
                </div>
              )}

              {/* ─── PAGE 4: Experience ─── */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Tell us about your previous experience with journey work.</p>
                    <PromptTextarea
                      value={form.journeyWorkExperience}
                      onChange={(v) => update('journeyWorkExperience', v)}
                      hint="Share broad details without identifying terms or names."
                      placeholder="Your experience…"
                    />
                  </div>
                  <div>
                    <p className={proseSm}>Tell us about your experience with this medicine.</p>
                    <PromptTextarea
                      value={form.medicineExperience}
                      onChange={(v) => update('medicineExperience', v)}
                      hint="Include handshake, hug, and full-embrace; note numbers of experiences."
                      placeholder="Your experience…"
                    />
                  </div>
                  <div>
                    <p className={proseSm}>Tell us about your experience serving.</p>
                    <PromptTextarea
                      value={form.servingExperience}
                      onChange={(v) => update('servingExperience', v)}
                      hint="Share your service experience without identifying terms or names."
                      placeholder="Your experience…"
                    />
                  </div>
                </div>
              )}

              {/* ─── PAGE 5: Your Story ─── */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>What life circumstances brought you to this work?</p>
                    <PromptTextarea
                      value={form.lifeCircumstances}
                      onChange={(v) => update('lifeCircumstances', v)}
                      placeholder="Share your story…"
                    />
                  </div>
                  <div>
                    <p className={proseSm}>Who can you reach out to for help integrating what you experience during your session?</p>
                    <PromptTextarea
                      value={form.integrationSupport}
                      onChange={(v) => update('integrationSupport', v)}
                      placeholder="Your support system…"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* ─── PAGE 6: Physical Health ─── */}
              {step === 6 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Any current significant physical health issues?</p>
                    <PromptTextarea value={form.physicalHealthIssues} onChange={(v) => update('physicalHealthIssues', v)} rows={3} />
                  </div>
                  <div>
                    <p className={proseSm}>Are you taking any prescription medication for physical conditions?</p>
                    <PromptTextarea value={form.physicalMedications} onChange={(v) => update('physicalMedications', v)} hint="Include type, reason, and dosage." rows={3} />
                  </div>
                  <div>
                    <p className={proseSm}>Supplements that are part of an ongoing regimen:</p>
                    <PromptTextarea value={form.supplements} onChange={(v) => update('supplements', v)} rows={2} />
                  </div>
                  <div>
                    <p className={proseSm}>Any allergies that require regular treatment?</p>
                    <PromptTextarea value={form.allergies} onChange={(v) => update('allergies', v)} rows={2} />
                  </div>
                </div>
              )}

              {/* ─── PAGE 7: Symptoms & Diet ─── */}
              {step === 7 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Which of these do you experience?</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={PHYSICAL_SYMPTOMS}
                        selected={form.physicalSymptoms}
                        onChange={(v) => update('physicalSymptoms', v)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-8">
                    <p className={proseSm}>Any dietary preferences?</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={DIETARY_OPTIONS}
                        selected={form.dietaryPreferences}
                        onChange={(v) => update('dietaryPreferences', v)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PAGE 8: Mental Health ─── */}
              {step === 8 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Have you ever been diagnosed with a mental illness or DSM disorder?</p>
                    <PromptTextarea value={form.dsmDiagnosis} onChange={(v) => update('dsmDiagnosis', v)} hint="e.g. major depression, BPD — what was the diagnosis and when?" rows={3} />
                  </div>
                  <div>
                    <p className={proseSm}>Any current significant mental health issues?</p>
                    <PromptTextarea value={form.mentalHealthIssues} onChange={(v) => update('mentalHealthIssues', v)} rows={3} />
                  </div>
                  <div>
                    <p className={proseSm}>Are you taking any prescription medication for psychological conditions?</p>
                    <PromptTextarea value={form.psychMedications} onChange={(v) => update('psychMedications', v)} hint="Include type and reason." rows={3} />
                  </div>
                  <div>
                    <p className={proseSm}>Any stimulant or recreational drug use?</p>
                    <PromptTextarea value={form.recreationalDrugUse} onChange={(v) => update('recreationalDrugUse', v)} hint="Type and frequency." rows={2} />
                  </div>
                  <div>
                    <p className={proseSm}>Have you ever considered suicide?</p>
                    <PromptTextarea value={form.suicideConsideration} onChange={(v) => update('suicideConsideration', v)} hint="If yes, please briefly describe." rows={2} />
                  </div>
                  <div>
                    <p className={proseSm}>Are you currently followed by a mental health professional?</p>
                    <PromptTextarea value={form.mentalHealthProfessional} onChange={(v) => update('mentalHealthProfessional', v)} hint="If yes, what kind and reason?" rows={2} />
                  </div>
                </div>
              )}

              {/* ─── PAGE 9: Stress ─── */}
              {step === 9 && (
                <div className="space-y-8">
                  <div>
                    <p className={prose}>
                      I'd rate my stress at{' '}
                      <span className="inline-block font-semibold text-[hsl(160_30%_72%)] tabular-nums text-4xl sm:text-5xl align-baseline">
                        {form.stressLevel[0]}
                      </span>
                      {' '}out of 10.
                    </p>
                    <div className="mt-6 px-2">
                      <Slider
                        value={form.stressLevel}
                        onValueChange={(v) => update('stressLevel', v)}
                        min={0} max={10} step={1}
                        className="conv-slider"
                      />
                      <div className="flex justify-between text-xs text-white/30 mt-2">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-8">
                    <p className={proseSm}>I have experienced the following:</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={LIFE_EXPERIENCES}
                        selected={form.lifeExperiences}
                        onChange={(v) => update('lifeExperiences', v)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className={proseSm}>Most significant current sources of stress:</p>
                    <PromptTextarea value={form.stressSources} onChange={(v) => update('stressSources', v)} rows={3} />
                  </div>
                </div>
              )}

              {/* ─── PAGE 10: Coping ─── */}
              {step === 10 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Which of these cognitive symptoms do you experience?</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={COGNITIVE_SYMPTOMS}
                        selected={form.cognitiveSymptoms}
                        onChange={(v) => update('cognitiveSymptoms', v)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-8">
                    <p className={proseSm}>I take the edge off by:</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={COPING_MECHANISMS}
                        selected={form.copingMechanisms}
                        onChange={(v) => update('copingMechanisms', v)}
                      />
                    </div>
                  </div>

                  <div>
                    <p className={proseSm}>Any further details about your stress, anxiety, or trauma history:</p>
                    <PromptTextarea value={form.traumaDetails} onChange={(v) => update('traumaDetails', v)} rows={3} />
                  </div>
                </div>
              )}

              {/* ─── PAGE 11: Self-Care ─── */}
              {step === 11 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>How do you take care of yourself?</p>
                    <div className="mt-4 space-y-2">
                      {SELF_CARE_OPTIONS.map((option) => (
                        <motion.button
                          key={option}
                          type="button"
                          onClick={() => update('selfCare', option)}
                          className={`w-full text-left rounded-xl px-5 py-3.5 text-sm font-medium border transition-all duration-200 ${
                            form.selfCare === option
                              ? 'bg-[hsl(160_30%_65%/0.15)] border-[hsl(160_30%_65%/0.5)] text-white'
                              : 'bg-white/[0.03] border-white/10 text-white/50 hover:bg-white/[0.06] hover:text-white/70'
                          }`}
                          whileTap={{ scale: 0.98 }}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/[0.06] pt-8">
                    <p className={proseSm}>Who do I turn to for support?</p>
                    <div className="mt-4">
                      <ChipSelector
                        items={SUPPORT_NETWORK}
                        selected={form.supportNetwork}
                        onChange={(v) => update('supportNetwork', v)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── PAGE 12: Goals ─── */}
              {step === 12 && (
                <div className="space-y-8">
                  <div>
                    <p className={proseSm}>Tell us about your strengths, hobbies, and what you do for fun:</p>
                    <PromptTextarea value={form.strengthsHobbies} onChange={(v) => update('strengthsHobbies', v)} />
                  </div>
                  <div>
                    <p className={proseSm}>What are your goals for joining this training?</p>
                    <PromptTextarea value={form.trainingGoals} onChange={(v) => update('trainingGoals', v)} />
                  </div>
                  <div>
                    <p className={proseSm}>Anything else we should know to support you best?</p>
                    <PromptTextarea value={form.anythingElse} onChange={(v) => update('anythingElse', v)} rows={3} />
                  </div>
                </div>
              )}

              {/* ─── PAGE 13: Review ─── */}
              {step === 13 && (
                <div className="space-y-8">
                  <p className={prose}>Almost done — let's review.</p>

                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 space-y-3 text-sm text-white/70">
                    <ReviewLine label="Name" value={`${form.preferredName || form.firstName} ${form.lastName}`} />
                    <ReviewLine label="Email" value={form.email} />
                    <ReviewLine label="Phone" value={form.phone} />
                    {form.interestedDates.length > 0 && (
                      <ReviewLine label="Dates" value={form.interestedDates.join(' · ')} />
                    )}
                    {form.allergies && <ReviewLine label="Allergies" value={form.allergies} />}
                    {form.dietaryPreferences.length > 0 && (
                      <ReviewLine label="Dietary" value={form.dietaryPreferences.join(', ')} />
                    )}
                    {form.signalHandle && <ReviewLine label="Signal" value={form.signalHandle} />}
                    {form.trainingGoals && (
                      <ReviewLine label="Goals" value={form.trainingGoals.length > 120 ? form.trainingGoals.substring(0, 120) + '…' : form.trainingGoals} />
                    )}
                  </div>

                  <motion.label
                    className={`flex items-start gap-4 rounded-xl border px-5 py-4 cursor-pointer transition-all duration-200 ${
                      form.agreeToTerms
                        ? 'border-[hsl(160_30%_65%/0.5)] bg-[hsl(160_30%_65%/0.08)]'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Checkbox
                      checked={form.agreeToTerms}
                      onCheckedChange={(v) => update('agreeToTerms', !!v)}
                      className="mt-0.5 border-white/30 data-[state=checked]:bg-[hsl(160_30%_65%)] data-[state=checked]:border-[hsl(160_30%_65%)]"
                    />
                    <span className="text-sm text-white/60 leading-relaxed">
                      I confirm the information is accurate and consent to it being used to support me during training. My information will be kept strictly confidential.
                    </span>
                  </motion.label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ─── Navigation ─── */}
          <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6">
            <Button
              variant="outline"
              onClick={prev}
              disabled={step === 0}
              className="gap-1.5 border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>

            <span className="text-xs text-white/20 tabular-nums">
              {step + 1} / {SECTIONS.length}
            </span>

            {step < SECTIONS.length - 1 ? (
              <Button
                onClick={next}
                className="gap-1.5 bg-[hsl(160_30%_55%)] text-black hover:bg-[hsl(160_30%_65%)] border-0"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="gap-1.5 bg-[hsl(160_30%_55%)] text-black hover:bg-[hsl(160_30%_65%)] border-0"
              >
                <Send className="h-4 w-4" /> Submit
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Helper components ── */

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-white/30 uppercase text-xs tracking-wider w-16 shrink-0 pt-0.5">{label}</span>
      <span className="text-white/70">{value}</span>
    </div>
  );
}
