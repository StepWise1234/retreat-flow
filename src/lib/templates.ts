import { MessageTemplate, PipelineStage } from './types';

export const defaultTemplates: MessageTemplate[] = [
  {
    id: 'tpl-1',
    stage: 'Leads',
    subject: 'Let\'s schedule a Chemistry Call – {{retreatName}}',
    body: `Hi {{fullName}},

Thank you for your interest in our {{retreatName}} retreat in {{location}}!

I'd love to schedule a brief chemistry call to learn more about you and share details about the experience.

Would any of these times work for you?

Looking forward to connecting,
Retreat Team`,
  },
  {
    id: 'tpl-2',
    stage: 'Chemistry Call',
    subject: 'Your Application for {{retreatName}}',
    body: `Hi {{fullName}},

Great speaking with you! I'm excited about the possibility of having you join us in {{location}} ({{startDate}} – {{endDate}}).

Please fill out the application when you're ready. Here's the link: [Application Link]

Warmly,
Retreat Team`,
  },
  {
    id: 'tpl-3',
    stage: 'Application',
    subject: 'Interview Scheduling – {{retreatName}}',
    body: `Hi {{fullName}},

Thank you for your application to {{retreatName}}. We'd love to schedule a brief interview to get to know you better.

Please let me know your availability for a 20-minute call this week.

Best,
Retreat Team`,
  },
  {
    id: 'tpl-4',
    stage: 'Interview',
    subject: 'Welcome to {{retreatName}}!',
    body: `Hi {{fullName}},

Wonderful news — you've been approved for {{retreatName}} in {{location}}!

We'll be sending you payment details shortly. If you have any questions, don't hesitate to reach out.

Excited to have you,
Retreat Team`,
  },
  {
    id: 'tpl-5',
    stage: 'Approval',
    subject: 'Payment Details – {{retreatName}}',
    body: `Hi {{fullName}},

Here are the payment details for your spot at {{retreatName}}:

Payment link: {{paymentLink}}

Please complete payment within 7 days to secure your spot. The retreat runs {{startDate}} through {{endDate}} in {{location}}.

Thank you,
Retreat Team`,
  },
  {
    id: 'tpl-6',
    stage: 'Payment',
    subject: 'Choose Your Accommodation – {{retreatName}}',
    body: `Hi {{fullName}},

Payment received — thank you! 🎉

Time to choose your accommodation for the retreat. Please review the options and let us know your preference: {{accommodationLink}}

Best,
Retreat Team`,
  },
  {
    id: 'tpl-7',
    stage: 'Accommodation Selection',
    subject: 'Your Online Course Access – {{retreatName}}',
    body: `Hi {{fullName}},

You're all set with accommodation! Here's access to the pre-retreat online course to help you prepare:

Course link: {{courseLink}}

Please complete the modules before {{startDate}}. We can't wait to see you in {{location}}!

Warmly,
Retreat Team`,
  },
  {
    id: 'tpl-8',
    stage: 'Online Course Link',
    subject: 'Onboarding Complete – See You at {{retreatName}}!',
    body: `Hi {{fullName}},

Everything is set for your retreat experience! Here's a quick recap:

📍 Location: {{location}}
📅 Dates: {{startDate}} – {{endDate}}

We'll send a detailed logistics guide one week before. If you have any questions, reach out anytime.

See you soon!
Retreat Team`,
  },
];

export function fillTemplate(
  template: MessageTemplate,
  participant: { fullName: string; email: string },
  retreat: { retreatName: string; startDate: string; endDate: string; location: string }
): { subject: string; body: string } {
  const vars: Record<string, string> = {
    '{{fullName}}': participant.fullName,
    '{{email}}': participant.email,
    '{{retreatName}}': retreat.retreatName,
    '{{startDate}}': new Date(retreat.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{{endDate}}': new Date(retreat.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    '{{location}}': retreat.location,
    '{{paymentLink}}': '[Payment Link – configure in settings]',
    '{{accommodationLink}}': '[Accommodation Link – configure in settings]',
    '{{courseLink}}': '[Course Link – configure in settings]',
  };

  let subject = template.subject;
  let body = template.body;

  Object.entries(vars).forEach(([key, value]) => {
    subject = subject.split(key).join(value);
    body = body.split(key).join(value);
  });

  return { subject, body };
}
