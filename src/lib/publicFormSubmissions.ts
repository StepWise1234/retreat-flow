type SupabaseFunctionsClient = {
  functions: {
    invoke: (name: string, options: { body: unknown }) => Promise<{ data: unknown; error: { message?: string } | null }>;
  };
};

async function invokePublicFormFunction(
  client: SupabaseFunctionsClient,
  functionName: string,
  body: unknown,
) {
  const { data, error } = await client.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(error.message || 'Submission failed');
  }

  if (data && typeof data === 'object' && 'error' in data) {
    const message = typeof data.error === 'string' ? data.error : 'Submission failed';
    throw new Error(message);
  }

  return data;
}

export function submitFacilitatorInquiry(client: SupabaseFunctionsClient, body: unknown) {
  return invokePublicFormFunction(client, 'submit-facilitator-inquiry', body);
}

export function submitPublicFeedback(client: SupabaseFunctionsClient, body: unknown) {
  return invokePublicFormFunction(client, 'submit-public-feedback', body);
}
