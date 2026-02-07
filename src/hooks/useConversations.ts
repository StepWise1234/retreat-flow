import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  participant_id: string;
  retreat_id: string | null;
  registration_id: string | null;
  channels_enabled: string[];
  last_message_at: string | null;
  last_message_preview: string | null;
  is_archived: boolean;
  unread_count: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationFilters {
  retreatId?: string;
  channel?: 'Email' | 'Signal' | 'all';
  unreadOnly?: boolean;
  isArchived?: boolean;
  search?: string;
}

export function useConversations(filters?: ConversationFilters) {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      let query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (filters?.retreatId) {
        query = query.eq('retreat_id', filters.retreatId);
      }
      if (filters?.unreadOnly) {
        query = query.gt('unread_count', 0);
      }
      if (filters?.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      }
      if (filters?.channel && filters.channel !== 'all') {
        query = query.contains('channels_enabled', [filters.channel]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conv: Partial<Conversation> & { participant_id: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conv)
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Conversation> & { id: string }) => {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Mark all inbound unread messages as read
      await supabase
        .from('messages')
        .update({ read_status: 'Read' })
        .eq('conversation_id', conversationId)
        .eq('direction', 'Inbound')
        .eq('read_status', 'Unread');

      // Reset unread count
      const { data, error } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId)
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

/** Find or create a conversation for a participant + optional retreat/registration */
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      participantId: string;
      retreatId?: string;
      registrationId?: string;
      channel?: 'Email' | 'Signal';
    }) => {
      // Try to find existing conversation
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('participant_id', params.participantId)
        .eq('is_archived', false);

      if (params.retreatId) {
        query = query.eq('retreat_id', params.retreatId);
      }

      const { data: existing } = await query.limit(1);
      if (existing && existing.length > 0) {
        return existing[0] as Conversation;
      }

      // Create new conversation
      const channels = params.channel ? [params.channel] : ['Email'];
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_id: params.participantId,
          retreat_id: params.retreatId ?? null,
          registration_id: params.registrationId ?? null,
          channels_enabled: channels,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
