import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const appSource = readFileSync(join(process.cwd(), 'src', 'App.tsx'), 'utf8');

describe('legacy public-repo admin routes', () => {
  it('redirects legacy admin/login paths to the dedicated admin app', () => {
    expect(appSource).toContain('LegacyAdminRedirect');
    expect(appSource).toContain('https://app.stepwise.education');
    expect(appSource).not.toContain('<ProtectedRoute><Index /></ProtectedRoute>');
    expect(appSource).not.toContain('<Login />');
  });
});
