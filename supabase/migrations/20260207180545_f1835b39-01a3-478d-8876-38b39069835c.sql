
-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id TEXT NOT NULL,
  retreat_id TEXT,
  registration_id TEXT,
  channels_enabled TEXT[] NOT NULL DEFAULT '{Email}',
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  unread_count INTEGER NOT NULL DEFAULT 0,
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policy (matches existing pattern)
CREATE POLICY "Allow all access to conversations"
  ON public.conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for fast lookups
CREATE INDEX idx_conversations_participant ON public.conversations (participant_id);
CREATE INDEX idx_conversations_retreat ON public.conversations (retreat_id);
CREATE INDEX idx_conversations_last_msg ON public.conversations (last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_unread ON public.conversations (unread_count) WHERE unread_count > 0;
CREATE INDEX idx_conversations_archived ON public.conversations (is_archived);

-- Trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add new columns to messages table
ALTER TABLE public.messages
  ADD COLUMN conversation_id UUID REFERENCES public.conversations(id),
  ADD COLUMN direction TEXT NOT NULL DEFAULT 'Outbound',
  ADD COLUMN external_thread_id TEXT,
  ADD COLUMN read_status TEXT NOT NULL DEFAULT 'Read',
  ADD COLUMN raw_payload JSONB,
  ADD COLUMN provider TEXT;

-- Indexes on new message columns
CREATE INDEX idx_messages_conversation ON public.messages (conversation_id);
CREATE INDEX idx_messages_direction ON public.messages (direction);
CREATE INDEX idx_messages_read_status ON public.messages (read_status) WHERE read_status = 'Unread';
CREATE INDEX idx_messages_thread ON public.messages (external_thread_id);

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
