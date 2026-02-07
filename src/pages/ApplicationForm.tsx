import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export default function ApplicationForm() {
  const { retreats, addParticipant, addRegistration } = useApp();
  const [retreatId, setRetreatId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [signalHandle, setSignalHandle] = useState('');
  const [allergies, setAllergies] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const activeRetreats = retreats.filter((r) => r.status === 'Open' || r.status === 'Full');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!retreatId || !fullName.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const participant = addParticipant({
      fullName: fullName.trim(),
      email: email.trim(),
      signalHandle: signalHandle.trim(),
      allergies: allergies.trim(),
      specialRequests: specialRequests.trim(),
    });

    addRegistration(retreatId, participant.id, 'Application');
    toast.success(`${fullName} registered at Application stage`);

    // Reset
    setFullName('');
    setEmail('');
    setSignalHandle('');
    setAllergies('');
    setSpecialRequests('');
    setRetreatId('');
  };

  return (
    <Layout>
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Intake</h1>
            <p className="text-sm text-muted-foreground">
              Register a participant directly at the Application stage.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-6">
          <div>
            <Label htmlFor="retreat">Retreat *</Label>
            <Select value={retreatId} onValueChange={setRetreatId}>
              <SelectTrigger id="retreat" className="mt-1">
                <SelectValue placeholder="Select a retreat" />
              </SelectTrigger>
              <SelectContent>
                {activeRetreats.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.retreatName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="app-name">Full Name *</Label>
              <Input
                id="app-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="app-email">Email *</Label>
              <Input
                id="app-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="app-signal">Signal Handle</Label>
            <Input
              id="app-signal"
              value={signalHandle}
              onChange={(e) => setSignalHandle(e.target.value)}
              placeholder="@jane_doe"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="app-allergies">Allergies</Label>
            <Textarea
              id="app-allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="List any food allergies or dietary restrictions…"
              className="mt-1 h-20 resize-none"
            />
          </div>

          <div>
            <Label htmlFor="app-special">Special Requests</Label>
            <Textarea
              id="app-special"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Room preferences, mobility needs, etc."
              className="mt-1 h-20 resize-none"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Application
          </Button>
        </form>
      </div>
    </Layout>
  );
}
