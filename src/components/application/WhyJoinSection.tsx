import { Shield, Users, Heart, GraduationCap, Clock, Star } from 'lucide-react';

const VALUE_PROPS = [
  {
    icon: GraduationCap,
    title: 'Expert-Led Training',
    description: 'Learn from experienced facilitators with years of hands-on practice in harm reduction and ceremony support.',
  },
  {
    icon: Users,
    title: 'Small Cohorts',
    description: 'Intimate group sizes ensure personalized mentorship and deep connections with your fellow trainees.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'Our rigorous screening process ensures a safe, supportive environment for every participant.',
  },
  {
    icon: Heart,
    title: 'Holistic Approach',
    description: 'Integration of mind, body, and spirit throughout your training with ongoing aftercare support.',
  },
];

const STATS = [
  { value: '200+', label: 'Graduates' },
  { value: '4-Day', label: 'Immersive Retreats' },
  { value: '98%', label: 'Recommend Us' },
  { value: '5+', label: 'Years Running' },
];

const TESTIMONIALS = [
  {
    quote: "This training changed the entire trajectory of my practice. The depth of knowledge and care from the facilitators is unmatched.",
    author: 'Recent Graduate',
    cohort: 'Fall 2025 Cohort',
  },
  {
    quote: "I felt held and supported through every step. The screening process itself showed me how much they care about safety.",
    author: 'Training Participant',
    cohort: 'Spring 2025 Cohort',
  },
];

export default function WhyJoinSection() {
  return (
    <div className="mb-8 space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-card/80 backdrop-blur-sm p-4 text-center hover-lift"
          >
            <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Value propositions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group rounded-xl border bg-card/80 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="space-y-3">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card/80 backdrop-blur-sm p-5 relative overflow-hidden"
          >
            <div className="absolute top-3 right-4 flex gap-0.5">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="h-3 w-3 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-sm text-foreground/90 italic leading-relaxed pr-16">
              "{t.quote}"
            </blockquote>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">
                  {t.author.charAt(0)}
                </span>
              </div>
              <div>
                <span className="text-xs font-medium text-foreground">{t.author}</span>
                <span className="text-xs text-muted-foreground ml-1.5">· {t.cohort}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA nudge */}
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Limited Spots Available</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Each cohort is intentionally small to ensure quality training. Complete your application below — the process takes about 15 minutes.
        </p>
      </div>
    </div>
  );
}
