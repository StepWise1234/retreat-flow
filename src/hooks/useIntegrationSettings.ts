import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type EmailSettings = Tables<'email_settings'>;
export type SignalSettings = Tables<'signal_settings'>;
export type IntegrationLog = Tables<'integration_logs'>;

export function useEmailSettings() {
  return useQuery({
    queryKey: ['email_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EmailSettings | null;
    },
  });
}

export function useUpdateEmailSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'email_settings'> }) => {
      const { data, error } = await supabase
        .from('email_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as EmailSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email_settings'] });
    },
  });
}

export function useSignalSettings() {
  return useQuery({
    queryKey: ['signal_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signal_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SignalSettings | null;
    },
  });
}

export function useUpdateSignalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'signal_settings'> }) => {
      const { data, error } = await supabase
        .from('signal_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SignalSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signal_settings'] });
    },
  });
}

export function useIntegrationLogs(limit = 20) {
  return useQuery({
    queryKey: ['integration_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as IntegrationLog[];
    },
  });
}
