import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePortalAuth } from './usePortalAuth';

export function useApplication() {
  const { user } = usePortalAuth();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['application', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // First check if user already has an application
      const { data: existingApp, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (existingApp) return existingApp;

      // No application found - check if there's a matching applicant record by email
      const userEmail = user.email?.toLowerCase();
      if (!userEmail) return null;

      const { data: matchingApplicant } = await supabase
        .from('applicants')
        .select('id, name, email, training_id')
        .ilike('email', userEmail)
        .maybeSingle();

      if (matchingApplicant && matchingApplicant.training_id) {
        // Found a matching applicant with a training assignment - auto-create application
        const nameParts = matchingApplicant.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newApp, error: createError } = await supabase
          .from('applications')
          .insert({
            user_id: user.id,
            email: userEmail,
            first_name: firstName,
            last_name: lastName,
            training_id: matchingApplicant.training_id,
            status: 'approved',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error auto-creating application:', createError);
          return null;
        }

        console.log('Auto-created application for existing applicant:', matchingApplicant.email);
        return newApp;
      }

      return null;
    },
    enabled: !!user,
  });

  const updateApplication = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      if (!user || !application) throw new Error('No application found');
      const { error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', application.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', user?.id] });
    },
  });

  return { application, isLoading, updateApplication };
}
