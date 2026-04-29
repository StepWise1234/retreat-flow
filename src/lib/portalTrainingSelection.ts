export type PortalTrainingSelectionClient = {
  functions: {
    invoke: (name: string, options: { body: Record<string, unknown> }) => Promise<{
      data: unknown;
      error: Error | { message?: string } | null;
    }>;
  };
};

export type PortalTrainingSelectionResult = {
  ok: boolean;
  application_id?: string | null;
  enrollment_id?: string | null;
  training_name?: string;
  price_cents?: number | null;
  payment_status?: string | null;
  already_registered?: boolean;
};

export async function selectPortalTraining(
  supabase: PortalTrainingSelectionClient,
  input: { trainingId: string; applicationId?: string | null },
): Promise<PortalTrainingSelectionResult> {
  const body: Record<string, unknown> = {
    training_id: input.trainingId,
  };

  if (input.applicationId) {
    body.application_id = input.applicationId;
  }

  const { data, error } = await supabase.functions.invoke('select-training', { body });

  if (error) {
    throw error instanceof Error ? error : new Error(error.message || 'Failed to select training');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data as PortalTrainingSelectionResult;
}
