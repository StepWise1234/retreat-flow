import { MessageTemplate, PipelineStage, Retreat } from './types';

export const defaultTemplates: MessageTemplate[] = [
  {
    id: 'tpl-1',
    stage: 'Leads',
    subject: 'Let\'s schedule a Chemistry Call – {{retreatName}}',
    body: `Hi {{firstName}},

Thank you for your interest in {{retreatName}}!

I'd love to schedule a brief chemistry call to learn more about you and share details about the experience.

Would any of these times work for you? {{scheduleLink}}

Looking forward to connecting,
Retreat Team`,
  },
  {
    id: 'tpl-2',
    stage: 'Chemistry Call',
    subject: 'Your Application for {{retreatName}}',
    body: `Hi {{firstName}},

Great speaking with you! I'm excited about the possibility of having you join us for {{retreatName}} ({{startDate}} – {{endDate}}).

Please fill out the application when you're ready. Here's the link: {{applicationLink}}

Warmly,
Retreat Team`,
  },
  {
    id: 'tpl-3',
    stage: 'Application',
    subject: 'Interview Scheduling – {{retreatName}}',
    body: `Hi {{firstName}},

Thank you for your application to {{retreatName}}. We'd love to schedule a brief interview to get to know you better.

Please let me know your availability for a 20-minute call this week.

Best,
Retreat Team`,
  },
  {
    id: 'tpl-4',
    stage: 'Interview',
    subject: 'Welcome to {{retreatName}} - Payment Details',
    body: `Hi {{firstName}},

Wonderful news - you've been approved for {{retreatName}}!

Here are the payment details to secure your spot:

Payment link: {{paymentLink}}

Please complete payment within 7 days. The retreat runs {{startDate}} through {{endDate}}.

If you have any questions, don't hesitate to reach out.

Excited to have you,
Retreat Team`,
  },
  {
    id: 'tpl-5',
    stage: 'Payment',
    subject: 'Choose Your Accommodation – {{retreatName}}',
    body: `Hi {{firstName}},

Payment received — thank you! 🎉

Time to choose your accommodation for the retreat. Please review the options and let us know your preference: {{accommodationLink}}

Best,
Retreat Team`,
  },
  {
    id: 'tpl-6',
    stage: 'Accommodation Selection',
    subject: 'Your Online Course Access – {{retreatName}}',
    body: `Hi {{firstName}},

You're all set with accommodation! Here's access to the pre-retreat online course to help you prepare:

Course link: {{courseLink}}

Please complete the modules before {{startDate}}.

Warmly,
Retreat Team`,
  },
  {
    id: 'tpl-7',
    stage: 'Online Course Link',
    subject: 'Onboarding Complete – See You at {{retreatName}}!',
    body: `Hi {{firstName}},

Everything is set for your retreat experience! Here's a quick recap:

📅 Dates: {{startDate}} – {{endDate}}

We'll send a detailed logistics guide one week before. If you have any questions, reach out anytime.

See you soon!
Retreat Team`,
  },
];

// Scheduling-specific templates (not tied to a pipeline stage)
export interface SchedulingTemplate {
  id: string;
  type: 'chemistry-invite' | 'interview-invite' | 'reminder';
  subject: string;
  body: string;
}

export const schedulingTemplates: SchedulingTemplate[] = [
  {
    id: 'sched-tpl-1',
    type: 'chemistry-invite',
    subject: 'Chemistry Call Invitation – {{retreatName}}',
    body: `Hi {{firstName}},

I'd love to schedule a chemistry call with you to discuss {{retreatName}}.

Here are some available times:
{{proposedTimes}}

Scheduling link: {{scheduleLink}}

Duration: ~20 minutes

Looking forward to connecting!
Retreat Team`,
  },
  {
    id: 'sched-tpl-2',
    type: 'interview-invite',
    subject: 'Interview Invitation – {{retreatName}}',
    body: `Hi {{firstName}},

We'd love to schedule your interview for {{retreatName}}.

Date/Time: {{appointmentDateTime}}
Duration: ~30 minutes
Link: {{appointmentLink}}

Please let us know if this works for you or if you'd prefer a different time.

Best,
Retreat Team`,
  },
  {
    id: 'sched-tpl-3',
    type: 'reminder',
    subject: 'Reminder: {{appointmentType}} Tomorrow – {{retreatName}}',
    body: `Hi {{firstName}},

Just a friendly reminder that your {{appointmentType}} for {{retreatName}} is scheduled for tomorrow.

Date/Time: {{appointmentDateTime}}
Link: {{appointmentLink}}

See you there!
Retreat Team`,
  },
];

export function fillTemplate(
  template: MessageTemplate | { subject: string; body: string },
  participant: { fullName: string; email: string },
  retreat: Retreat,
  extraVars?: Record<string, string>
): { subject: string; body: string } {
  const fallback = (link: string, label: string) =>
    link || `[${label} – configure in retreat settings]`;

  const firstName = participant.fullName.split(' ')[0] || participant.fullName;

  const vars: Record<string, string> = {
    '{{firstName}}': firstName,
    '{{fullName}}': participant.fullName,
    '{{email}}': participant.email,
    '{{retreatName}}': retreat.retreatName,
    '{{startDate}}': new Date(retreat.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{{endDate}}': new Date(retreat.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{{paymentLink}}': fallback(retreat.paymentLink, 'Payment Link'),
    '{{scheduleLink}}': fallback(retreat.chemistryCallLink, 'Schedule Link'),
    '{{accommodationLink}}': fallback(retreat.accommodationSelectionLink, 'Accommodation Link'),
    '{{courseLink}}': fallback(retreat.onlineCourseLink, 'Course Link'),
    '{{applicationLink}}': fallback(retreat.applicationLink, 'Application Link'),
    ...extraVars,
  };

  let subject = template.subject;
  let body = template.body;

  Object.entries(vars).forEach(([key, value]) => {
    subject = subject.split(key).join(value);
    body = body.split(key).join(value);
  });

  return { subject, body };
}
