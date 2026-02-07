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
      // 1. Insert the message as Queued
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
      if (error) throw error;
      const saved = data as Message;

      // 2. Trigger the appropriate edge function to actually send
      const functionName = saved.channel === 'Email' ? 'send-email' : 'send-signal';
      const { data: sendResult, error: sendErr } = await supabase.functions.invoke(functionName, {
        body: { messageId: saved.id },
      });

      if (sendErr) {
        console.warn(`[useSendMessage] Edge function ${functionName} error:`, sendErr);
        // Don't throw — message is queued, sending failed but can be retried
      }

      return saved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['email_settings'] });
      queryClient.invalidateQueries({ queryKey: ['signal_settings'] });
      queryClient.invalidateQueries({ queryKey: ['integration_logs'] });
    },
  });
}

export function useRetrySendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Message) => {
      // Reset status to Queued
      const { error: updateErr } = await supabase
        .from('messages')
        .update({ status: 'Queued' as const, error_message: null })
        .eq('id', message.id);
      if (updateErr) throw updateErr;

      // Invoke the edge function
      const functionName = message.channel === 'Email' ? 'send-email' : 'send-signal';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { messageId: message.id },
      });

      if (error) {
        console.warn(`[useRetrySendMessage] Edge function ${functionName} error:`, error);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['email_settings'] });
      queryClient.invalidateQueries({ queryKey: ['signal_settings'] });
      queryClient.invalidateQueries({ queryKey: ['integration_logs'] });
    },
  });
}
