import { describe, expect, it, vi } from 'vitest';
import { submitFacilitatorInquiry, submitPublicFeedback } from '@/lib/publicFormSubmissions';

function clientWithInvoke(result: unknown) {
  return {
    functions: {
      invoke: vi.fn().mockResolvedValue(result),
    },
    from: vi.fn(),
  };
}

describe('public form submissions', () => {
  it('submits facilitator inquiries through an Edge Function, not direct table insert', async () => {
    const client = clientWithInvoke({ data: { ok: true }, error: null });
    const body = { first_name: 'Luna', email: 'luna@example.com' };

    await submitFacilitatorInquiry(client, body);

    expect(client.functions.invoke).toHaveBeenCalledWith('submit-facilitator-inquiry', { body });
    expect(client.from).not.toHaveBeenCalled();
  });

  it('submits public feedback through an Edge Function, not direct table insert', async () => {
    const client = clientWithInvoke({ data: { ok: true }, error: null });
    const body = { first_name: 'Luna', email: 'luna@example.com', overall_rating: 5 };

    await submitPublicFeedback(client, body);

    expect(client.functions.invoke).toHaveBeenCalledWith('submit-public-feedback', { body });
    expect(client.from).not.toHaveBeenCalled();
  });

  it('throws Edge Function errors', async () => {
    const client = clientWithInvoke({ data: null, error: { message: 'Failed' } });

    await expect(submitPublicFeedback(client, {})).rejects.toThrow('Failed');
  });
});
