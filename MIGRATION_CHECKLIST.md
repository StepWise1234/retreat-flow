# Admin System Migration to Supabase - Feature Checklist

## Current Features (AppContext) - Must All Work After Migration

### Retreats Management
- [ ] List all retreats on dashboard
- [ ] Create new retreat with all fields:
  - retreatName, startDate, endDate, location
  - cohortSizeTarget, status (Draft/Open/Full/Closed/Archived)
  - capacityOverride, autoMarkFull, autoReopenWhenBelowCapacity
  - chemistryCallLink, applicationLink, paymentLink
  - accommodationSelectionLink, onlineCourseLink
  - accommodationOptions (label, description, priceAdjustment)
  - notes
- [ ] Update retreat details
- [ ] Retreat color coding (8 gradient palettes)
- [ ] Retreat visibility toggle (show/hide)
- [ ] Rename retreat

### Participants Management
- [ ] List participants
- [ ] Add participant (fullName, email, signalHandle, allergies, specialRequests)
- [ ] View participant across multiple retreats

### Registrations (Pipeline)
- [ ] 8-stage pipeline: Leads, Chemistry Call, Application, Interview, Approval, Payment, Accommodation Selection, Online Course Link
- [ ] Move participant between stages (with note)
- [ ] Bulk move multiple participants
- [ ] Stage history tracking (stage, date, note)
- [ ] Activity timeline (action, notes, performedBy, date)
- [ ] Tags on registrations
- [ ] Bulk add/remove tags
- [ ] Ops notes per registration
- [ ] Last touched timestamp
- [ ] Auto-mark retreat Full when capacity reached
- [ ] Auto-reopen retreat when below capacity
- [ ] Low-spots warning toast

### Accommodation
- [ ] Select accommodation choice from retreat's options
- [ ] Price adjustment tracking
- [ ] Accommodation notes

### Payments
- [ ] Payment status (Unpaid/Partial/Paid/Refunded)
- [ ] Amount due tracking
- [ ] Amount paid tracking
- [ ] Payment activity logging

### Scheduling (Appointments)
- [ ] Chemistry Call appointments
- [ ] Interview appointments
- [ ] Appointment fields: startDateTime, endDateTime, timezone, status, locationOrLink, notes
- [ ] Appointment statuses: Proposed, Scheduled, Completed, NoShow, Canceled
- [ ] Registration scheduling status sync (NotScheduled, Proposed, Scheduled, Completed, NoShow)
- [ ] View appointments for retreat
- [ ] View appointments for registration

### Risk & Care
- [ ] Risk level (None/Low/Medium/High)
- [ ] Care flags (Allergies, Dietary restrictions, Accessibility needs, etc.)
- [ ] Care notes
- [ ] Care flag other text
- [ ] Flagged at/by tracking

### Tasks
- [ ] Create task (title, description, dueDate, priority)
- [ ] Task status (Open/Done/Snoozed)
- [ ] Task priority (Low/Medium/High)
- [ ] View tasks for retreat
- [ ] View tasks for registration
- [ ] Complete task tracking

### Message Templates
- [ ] Stage-specific templates
- [ ] Template subject and body
- [ ] Update templates

### UI Components That Must Still Work
- [ ] Dashboard with retreat cards
- [ ] Retreat board (Kanban view)
- [ ] Retreat board (List view)
- [ ] Retreat board (Calendar view)
- [ ] Retreat board (Tasks view)
- [ ] Participant cards
- [ ] Participant detail sheet
- [ ] Stage tracker
- [ ] Quick add lead dialog
- [ ] Capacity banner
- [ ] Board filters
- [ ] Bulk action bar
- [ ] Accommodation selector
- [ ] Financial summary
- [ ] Scheduling panel
- [ ] Risk/care panel
- [ ] Task panel
- [ ] Message composer
- [ ] Message history
- [ ] Activity timeline
- [ ] Create retreat wizard

## Portal Integration (Must Continue Working)
- [ ] Application form submission
- [ ] Portal login
- [ ] Portal dashboard
- [ ] Portal application view
- [ ] Portal accommodation (room selection)
- [ ] Portal accommodation (meal selection)
- [ ] Portal course videos
- [ ] Trainer mode (multi-training selection)
- [ ] Trainer assignments

## New Capabilities After Migration
- [ ] Real data persistence (no more seed data reset)
- [ ] Admin can see portal applications in pipeline
- [ ] Trainer management from admin UI
- [ ] Shared data between admin and portal
