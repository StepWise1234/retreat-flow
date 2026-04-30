import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

describe('portal accommodation RLS migrations', () => {
  it('restores authenticated participants access to read and update only their own applications', () => {
    const migrations = readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .map((file) => readFileSync(join(migrationsDir, file), 'utf8'))
      .join('\n');

    expect(migrations).toContain('applications_owner_select');
    expect(migrations).toContain('applications_owner_update');
    expect(migrations).toMatch(/FOR SELECT\s+TO authenticated\s+USING \(auth\.uid\(\) = user_id\)/s);
    expect(migrations).toMatch(/FOR UPDATE\s+TO authenticated\s+USING \(auth\.uid\(\) = user_id\)\s+WITH CHECK \(auth\.uid\(\) = user_id\)/s);
  });
});
