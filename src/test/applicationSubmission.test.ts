import { describe, expect, it, vi } from "vitest";
import { submitApplicantApplication } from "@/lib/applicationSubmission";

describe("submitApplicantApplication", () => {
  it("submits public applications through the server-side edge function, not direct table writes", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
    const from = vi.fn();
    const supabase = { functions: { invoke }, from };
    const payload = { name: "Ada Lovelace", email: "ada@example.com", training_id: "training-1" };

    await submitApplicantApplication(supabase, payload);

    expect(invoke).toHaveBeenCalledWith("submit-application", { body: payload });
    expect(from).not.toHaveBeenCalled();
  });

  it("throws when the edge function returns an error", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: new Error("RLS denied") });
    const supabase = { functions: { invoke }, from: vi.fn() };

    await expect(
      submitApplicantApplication(supabase, { name: "Ada Lovelace", email: "ada@example.com" }),
    ).rejects.toThrow("RLS denied");
  });
});
