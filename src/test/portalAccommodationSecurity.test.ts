import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const migrationsDir = join(process.cwd(), 'supabase', 'migrations');

function allMigrations() {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .map((file) => readFileSync(join(migrationsDir, file), 'utf8'))
    .join('\n');
}

describe('portal accommodation security hardening migrations', () => {
  it('prevents participants from self-escalating application role or admin-controlled fields', () => {
    const migrations = allMigrations();

    expect(migrations).toContain('guard_participant_application_fields');
    expect(migrations).toMatch(/NEW\.role\s*:=\s*'participant'/);
    expect(migrations).toContain('Application field is admin-controlled');
  });

  it('removes participant room creation and application-role based room reservation admin bypasses', () => {
    const migrations = allMigrations();

    expect(migrations).toContain('DROP POLICY IF EXISTS "rooms_insert_authenticated" ON public.rooms');
    expect(migrations).toContain('DROP POLICY IF EXISTS "reservations_insert_own" ON public.room_reservations');
    expect(migrations).toContain('DROP POLICY IF EXISTS "room_reservations_insert" ON public.room_reservations');
    expect(migrations).toContain('room_reservations_insert_own_for_application');
    expect(migrations).toContain('public.is_admin()');
  });
});
