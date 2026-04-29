import { describe, expect, it } from 'vitest';
import { shouldShowPortalEvent, type Event } from '@/hooks/useEvents';

const baseEvent: Event = {
  id: 'event-id',
  name: 'May 27 - 30, 2026',
  training_level: 'Beginning',
  training_type: null,
  start_date: '2026-05-27',
  end_date: '2026-05-30',
  location: 'Retreat Center',
  max_capacity: 6,
  spots_filled: 0,
  status: 'Open',
  notes: null,
  description: null,
  is_visible: true,
  show_on_apply: false,
  price_cents: 350000,
  max_guests: null,
};

describe('portal event visibility', () => {
  it('shows paid trainings in /portal/events even when hidden from public apply', () => {
    expect(shouldShowPortalEvent(baseEvent, 'Beginning')).toBe(true);
  });

  it('does not show the special application waitlist pseudo-training', () => {
    expect(
      shouldShowPortalEvent(
        {
          ...baseEvent,
          id: 'waitlist-id',
          name: 'Waitlist',
          training_type: 'Standard',
        },
        null,
      ),
    ).toBe(false);
  });

  it('keeps hidden unpriced trainings hidden from portal events', () => {
    expect(
      shouldShowPortalEvent(
        {
          ...baseEvent,
          id: 'hidden-unpriced-training',
          price_cents: null,
          show_on_apply: false,
        },
        null,
      ),
    ).toBe(false);
  });

  it('treats workshop/online type casing consistently', () => {
    expect(
      shouldShowPortalEvent(
        {
          ...baseEvent,
          id: 'workshop-id',
          training_type: 'workshop',
          show_on_apply: false,
          price_cents: null,
        },
        'Advanced',
      ),
    ).toBe(true);
  });
});
