import { useState } from 'react';
import Layout from '@/components/Layout';
import ConversationList from '@/components/messaging/ConversationList';
import ConversationThread from '@/components/messaging/ConversationThread';
import ParticipantDetailSheet from '@/components/ParticipantDetailSheet';

export default function MessageCenter() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [detailRegistrationId, setDetailRegistrationId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-theme(spacing.20))] rounded-xl border bg-card overflow-hidden">
        {/* Left: Conversation list */}
        <div className="w-80 shrink-0">
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        {/* Right: Thread view */}
        <div className="flex-1 min-w-0">
          <ConversationThread
            conversationId={selectedConversationId}
            onOpenParticipant={setDetailRegistrationId}
          />
        </div>
      </div>

      {/* Participant detail sheet */}
      <ParticipantDetailSheet
        registrationId={detailRegistrationId}
        onClose={() => setDetailRegistrationId(null)}
      />
    </Layout>
  );
}
