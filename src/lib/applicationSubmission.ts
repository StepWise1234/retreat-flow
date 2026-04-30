export type SupabaseApplicationClient = {
  functions: {
    invoke: (name: string, options: { body: Record<string, unknown> }) => Promise<{
      data: unknown;
      error: Error | { message?: string } | null;
    }>;
  };
};

export async function submitApplicantApplication(
  supabase: SupabaseApplicationClient,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase.functions.invoke("submit-application", {
    body: payload,
  });

  if (error) {
    throw error instanceof Error ? error : new Error(error.message || "Failed to submit application");
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data;
}
