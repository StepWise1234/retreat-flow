import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import RetreatCard from '@/components/RetreatCard';
import CreateRetreatWizard from '@/components/CreateRetreatWizard';
import { Mountain } from 'lucide-react';

export default function Index() {
  const { retreats, registrations } = useApp();

  // Show only Open and Full retreats on dashboard (not Draft, Closed, Archived)
  const activeRetreats = retreats.filter((r) => r.status === 'Open' || r.status === 'Full');
  const draftRetreats = retreats.filter((r) => r.status === 'Draft');

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Retreats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of all retreats and their registration pipelines.
          </p>
        </div>
        <CreateRetreatWizard />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {activeRetreats.map((retreat, index) => (
          <RetreatCard
            key={retreat.id}
            retreat={retreat}
            registrations={registrations.filter((r) => r.retreatId === retreat.id)}
            colorIndex={index}
          />
        ))}
      </div>

      {activeRetreats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Mountain className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No active retreats</p>
          <p className="text-sm">Create a retreat or open a draft to get started.</p>
        </div>
      )}

      {/* Drafts */}
      {draftRetreats.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Drafts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {draftRetreats.map((retreat, index) => (
              <RetreatCard
                key={retreat.id}
                retreat={retreat}
                registrations={registrations.filter((r) => r.retreatId === retreat.id)}
                colorIndex={activeRetreats.length + index}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
