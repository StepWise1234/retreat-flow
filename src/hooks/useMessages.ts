import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;
export type DbMessageTemplate = Tables<'message_templates'>;

export function useMessagesForParticipant(participantId: string | undefined) {
  return useQuery({
    queryKey: ['messages', 'participant', participantId],
    queryFn: async () => {
      if (!participantId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('participant_id', participantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!participantId,
  });
}

export function useMessagesForRegistration(registrationId: string | undefined) {
  return useQuery({
    queryKey: ['messages', 'registration', registrationId],
    queryFn: async () => {
      if (!registrationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!registrationId,
  });
}

export function useMessageTemplates(channel?: 'Email' | 'Signal' | 'SMS') {
  return useQuery({
    queryKey: ['message_templates', channel],
    queryFn: async () => {
      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (channel) {
        query = query.eq('channel', channel);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as DbMessageTemplate[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: MessageInsert) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
      if (error) throw error;
      return data as Message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
