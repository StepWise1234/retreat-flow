import { describe, expect, it, vi } from 'vitest';
import { selectPortalTraining } from '@/lib/portalTrainingSelection';

describe('selectPortalTraining', () => {
  it('invokes the authenticated select-training Edge Function with only the selection payload', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const supabase = { functions: { invoke } };

    const result = await selectPortalTraining(supabase, {
      trainingId: 'training-123',
      applicationId: 'application-456',
    });

    expect(invoke).toHaveBeenCalledWith('select-training', {
      body: {
        training_id: 'training-123',
        application_id: 'application-456',
      },
    });
    expect(result).toEqual({ ok: true });
  });

  it('throws when the Edge Function returns an error payload', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { error: 'Training is no longer available' }, error: null });
    const supabase = { functions: { invoke } };

    await expect(selectPortalTraining(supabase, { trainingId: 'training-123' })).rejects.toThrow(
      'Training is no longer available',
    );
  });

  it('throws when the Edge Function invocation fails', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { message: 'not authenticated' } });
    const supabase = { functions: { invoke } };

    await expect(selectPortalTraining(supabase, { trainingId: 'training-123' })).rejects.toThrow(
      'not authenticated',
    );
  });
});
