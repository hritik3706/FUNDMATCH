"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Button, SelectField, TextField } from "@/components/ui";
import { addNotification } from "@/services/accountService";
import { createProfile } from "@/services/profileService";
import { FOUNDER_EXPERIENCE, GST_STATUSES, PROFILE_LOCATIONS, SECTORS, STAGES, type CreateProfileInput, type Profile } from "@/lib/types";

export function ProfileForm({ initial, submitLabel = "Save profile" }: { initial?: Profile | null; submitLabel?: string }) {
  const router = useRouter();
  const { saveProfile } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateProfileInput>({
    name: initial?.name ?? "",
    sector: initial?.sector ?? "Other",
    stage: initial?.stage ?? "Pre-seed",
    location: initial?.location ?? "Karnataka",
    fundingNeeded: initial?.fundingNeeded ?? 0,
    founderExperience: initial?.founderExperience ?? "First-time",
    incorporationDate: initial?.incorporationDate ?? "",
    gstStatus: initial?.gstStatus ?? undefined,
    dpiitRegistration: initial?.dpiitRegistration ?? false,
    previousFunding: initial?.previousFunding ?? 0,
  });

  function set<K extends keyof CreateProfileInput>(key: K, value: CreateProfileInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || form.fundingNeeded <= 0) {
      setError("Name is required, and funding needed must be a positive number.");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateProfileInput = {
        ...form,
        name: form.name.trim(),
        incorporationDate: form.incorporationDate || undefined,
        gstStatus: form.gstStatus || undefined,
        previousFunding: form.previousFunding || undefined,
      };
      const result = await createProfile(payload);
      saveProfile(result.profile);
      addNotification({
        title: "Profile saved",
        body: "Your startup profile was stored by the API.",
        category: "profile",
        href: "/startup",
      });
      router.push("/onboarding/classification");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The profile could not be saved.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <TextField label="Startup name" name="name" value={form.name} onChange={(event) => set("name", event.target.value)} />
      <SelectField label="Sector" name="sector" value={form.sector} onChange={(event) => set("sector", event.target.value as CreateProfileInput["sector"])}>
        {SECTORS.map((sector) => <option key={sector}>{sector}</option>)}
      </SelectField>
      <SelectField label="Stage" name="stage" value={form.stage} onChange={(event) => set("stage", event.target.value as CreateProfileInput["stage"])}>
        {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
      </SelectField>
      <SelectField label="Location" name="location" value={form.location} onChange={(event) => set("location", event.target.value as CreateProfileInput["location"])}>
        {PROFILE_LOCATIONS.map((location) => <option key={location}>{location}</option>)}
      </SelectField>
      <TextField label="Funding needed (INR)" name="fundingNeeded" type="number" min={1} value={form.fundingNeeded || ""} onChange={(event) => set("fundingNeeded", Number(event.target.value))} />
      <SelectField label="Founder experience" name="founderExperience" value={form.founderExperience} onChange={(event) => set("founderExperience", event.target.value as CreateProfileInput["founderExperience"])}>
        {FOUNDER_EXPERIENCE.map((item) => <option key={item}>{item}</option>)}
      </SelectField>
      <TextField label="Incorporation date" name="incorporationDate" type="date" value={form.incorporationDate ?? ""} onChange={(event) => set("incorporationDate", event.target.value)} hint="Leave blank if not provided." />
      <SelectField label="GST status" name="gstStatus" value={form.gstStatus ?? ""} onChange={(event) => set("gstStatus", (event.target.value || undefined) as CreateProfileInput["gstStatus"])}>
        <option value="">Not provided</option>
        {GST_STATUSES.map((status) => <option key={status}>{status}</option>)}
      </SelectField>
      <TextField label="Previous funding (INR)" name="previousFunding" type="number" min={0} value={form.previousFunding ?? 0} onChange={(event) => set("previousFunding", Number(event.target.value))} />
      <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
        <input type="checkbox" checked={Boolean(form.dpiitRegistration)} onChange={(event) => set("dpiitRegistration", event.target.checked)} />
        DPIIT recognition
      </label>
      {error ? <p className="md:col-span-2 font-body-sm text-body-sm text-error" role="alert">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving" : submitLabel}</Button>
      </div>
    </form>
  );
}
