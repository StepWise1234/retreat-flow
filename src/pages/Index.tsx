import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import RetreatCard from '@/components/RetreatCard';
import { Mountain } from 'lucide-react';

export default function Index() {
  const { retreats, registrations } = useApp();

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Active Retreats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all retreats and their registration pipelines.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {retreats.map((retreat) => (
          <RetreatCard
            key={retreat.id}
            retreat={retreat}
            registrations={registrations.filter((r) => r.retreatId === retreat.id)}
          />
        ))}
      </div>

      {retreats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Mountain className="mb-4 h-12 w-12" />
          <p className="text-lg font-medium">No retreats yet</p>
          <p className="text-sm">Create your first retreat to get started.</p>
        </div>
      )}
    </Layout>
  );
}
