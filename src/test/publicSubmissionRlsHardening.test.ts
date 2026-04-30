import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

function latestMigrationContaining(name: string) {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .reverse()
    .map((file) => readFileSync(join(migrationsDir, file), 'utf8'))
    .find((content) => content.includes(name)) || '';
}

describe('public application submission RLS hardening', () => {
  it('removes broad public insert policies after server-side submission functions exist', () => {
    const migration = latestMigrationContaining('lock_down_public_application_inserts');

    expect(migration).toContain('DROP POLICY IF EXISTS "Allow public application submit" ON public.applicants');
    expect(migration).toContain('DROP POLICY IF EXISTS "Anyone can submit an application" ON public.applications');
    expect(migration).toContain('lock_down_public_application_inserts');
  });

  it('removes broad public PII form insert policies after public form functions exist', () => {
    const migration = latestMigrationContaining('lock_down_public_form_inserts');

    expect(migration).toContain('DROP POLICY IF EXISTS "Allow public insert" ON public.facilitator_inquiries');
    expect(migration).toContain('DROP POLICY IF EXISTS "Allow public insert" ON public.public_feedback');
    expect(migration).toContain('ALTER COLUMN training_id DROP NOT NULL');
  });
});
