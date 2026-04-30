import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('backend health check monitor', () => {
  it('does not request Supabase OTP or magic links', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'backend-health-check.mjs'), 'utf8');

    expect(script).not.toContain('/auth/v1/otp');
    expect(script).not.toMatch(/signInWithOtp|magic-link|magiclink/i);
  });

  it('checks backend availability through non-email endpoints only', () => {
    const script = readFileSync(join(process.cwd(), 'scripts', 'backend-health-check.mjs'), 'utf8');

    expect(script).toContain('/auth/v1/settings');
    expect(script).toContain('/functions/v1/submit-application');
    expect(script).toContain('/functions/v1/select-training');
  });
});
