"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import { Button, Icon, SelectField, TextField } from "@/components/ui";
import { readJson, writeJson } from "@/lib/storage";
import { addNotification } from "@/services/accountService";
import { createProfile } from "@/services/profileService";
import { extractStory, inrToLakhs, storedToInr } from "@/lib/extractStory";
import { FOUNDER_EXPERIENCE, GST_STATUSES, PROFILE_LOCATIONS, SECTORS, STAGES, type CreateProfileInput, type Profile, type ProfileLocation, type Sector, type Stage } from "@/lib/types";

const DOCUMENTS_KEY = "ps41.documents";

type DocumentSlot = { id: string; name: string };

function websiteOrUndefined(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || /^https?:\/\/$/i.test(trimmed)) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function ProfileForm({ initial, submitLabel = "Save profile" }: { initial?: Profile | null; submitLabel?: string }) {
  const router = useRouter();
  const { saveProfile, saveStory, story } = useSession();
  const extracted = extractStory(story.text || "");
  const fromStory = Boolean(story.text.trim());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(extracted.product || story.subSector);
  const [form, setForm] = useState<CreateProfileInput>({
    name: extracted.name || initial?.name || "",
    sector: (extracted.sector || initial?.sector || "") as CreateProfileInput["sector"],
    stage: (extracted.stage || initial?.stage || "") as CreateProfileInput["stage"],
    location: (extracted.location || (fromStory ? "" : initial?.location || "")) as CreateProfileInput["location"],
    fundingNeeded: extracted.fundingInr || storedToInr(initial?.fundingNeeded),
    founderExperience: initial?.founderExperience ?? "First-time",
    incorporationDate: fromStory ? "" : (initial?.incorporationDate ?? ""),
    gstStatus: extracted.gstStatus ?? (fromStory ? undefined : initial?.gstStatus ?? undefined),
    dpiitRegistration: fromStory ? false : (initial?.dpiitRegistration ?? false),
    previousFunding: extracted.previousFundingInr || (fromStory ? 0 : storedToInr(initial?.previousFunding)),
    websiteUrl: initial?.websiteUrl ?? "",
  });

  useEffect(() => {
    const saved = readJson<DocumentSlot[]>(DOCUMENTS_KEY, []);
    if (saved.length > 0) setDocuments(saved);
  }, []);

  function set<K extends keyof CreateProfileInput>(key: K, value: CreateProfileInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.sector || !form.stage || !form.location || form.fundingNeeded <= 0) {
      setError("Add a name, sector, stage, state, and a funding amount in rupees.");
      return;
    }
    setLoading(true);
    try {
      const payload: CreateProfileInput = {
        ...form,
        sector: form.sector as Sector,
        stage: form.stage as Stage,
        location: form.location as ProfileLocation,
        name: form.name.trim(),
        fundingNeeded: inrToLakhs(form.fundingNeeded),
        previousFunding: form.previousFunding ? inrToLakhs(form.previousFunding) : undefined,
        incorporationDate: form.incorporationDate || undefined,
        gstStatus: form.gstStatus || undefined,
        websiteUrl: form.websiteUrl?.trim() || undefined,
      };
      saveStory({
        ...story,
        text: story.text,
        futureIntent: "",
        subSector: product,
        targetSector: form.sector,
        targetStage: form.stage,
        technology: extracted.technology,
        fundingPurpose: extracted.purpose,
        fundingInr: form.fundingNeeded,
      });
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
      <TextField label="What you are building" name="product" value={product} onChange={(event) => setProduct(event.target.value)} />
      <TextField label="Startup name" name="name" value={form.name} onChange={(event) => set("name", event.target.value)} />
      <TextField label="Startup website" name="websiteUrl" type="url" placeholder="https://yourstartup.com" value={form.websiteUrl ?? ""} onChange={(event) => set("websiteUrl", event.target.value)} hint="Public http or https address. The page text is used when scoring scheme fit." />
      <SelectField label="Sector" name="sector" value={form.sector} onChange={(event) => set("sector", event.target.value as CreateProfileInput["sector"])}>
        <option value="">Select sector</option>
        {SECTORS.map((sector) => <option key={sector}>{sector}</option>)}
      </SelectField>
      <SelectField label="Stage" name="stage" value={form.stage} onChange={(event) => set("stage", event.target.value as CreateProfileInput["stage"])}>
        <option value="">Select stage</option>
        {STAGES.map((stage) => <option key={stage}>{stage}</option>)}
      </SelectField>
      <SelectField label="Location" name="location" value={form.location} onChange={(event) => set("location", event.target.value as CreateProfileInput["location"])}>
        <option value="">Select state</option>
        {PROFILE_LOCATIONS.map((location) => <option key={location}>{location}</option>)}
      </SelectField>
      <TextField label="Funding needed (INR)" name="fundingNeeded" type="number" min={1} value={form.fundingNeeded || ""} onChange={(event) => set("fundingNeeded", Number(event.target.value))} hint="Enter rupees. 250000 is saved as 3 lakh for scheme matching." />
      <SelectField label="Founder experience" name="founderExperience" value={form.founderExperience} onChange={(event) => set("founderExperience", event.target.value as CreateProfileInput["founderExperience"])}>
        {FOUNDER_EXPERIENCE.map((item) => <option key={item}>{item}</option>)}
      </SelectField>
      <TextField label="Incorporation date" name="incorporationDate" type="date" value={form.incorporationDate ?? ""} onChange={(event) => set("incorporationDate", event.target.value)} hint="Leave blank if not provided." />
      <SelectField label="GST status" name="gstStatus" value={form.gstStatus ?? ""} onChange={(event) => set("gstStatus", (event.target.value || undefined) as CreateProfileInput["gstStatus"])}>
        <option value="">Not provided</option>
        {GST_STATUSES.map((status) => <option key={status}>{status}</option>)}
      </SelectField>
      <TextField label="Previous funding (INR)" name="previousFunding" type="number" min={0} value={form.previousFunding ?? 0} onChange={(event) => set("previousFunding", Number(event.target.value))} />
      <TextField label="Startup website" name="websiteUrl" value={form.websiteUrl ?? ""} onChange={(event) => set("websiteUrl", event.target.value)} placeholder="https://" hint="Optional. Used once to enrich matching." />
      <label className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
        <input type="checkbox" checked={Boolean(form.dpiitRegistration)} onChange={(event) => set("dpiitRegistration", event.target.checked)} />
        DPIIT recognition
      </label>
      <div className="md:col-span-2">
        <span className="mb-2 block font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">Documents</span>
        <div className="space-y-2">
          {documents.map((slot, index) => (
            <div key={slot.id} className="flex items-center gap-2">
              <label className="flex h-[42px] flex-1 cursor-pointer items-center rounded border border-outline-variant bg-surface-container-lowest px-3 font-body-md text-body-md">
                <span className={slot.name ? "text-on-surface" : "text-on-surface-variant"}>{slot.name || "Attach document"}</span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setDocuments((current) => current.map((item) => (item.id === slot.id ? { ...item, name: file.name } : item)));
                  }}
                />
              </label>
              {index === 0 ? (
                <button
                  type="button"
                  aria-label="Add another document"
                  onClick={() => setDocuments((current) => [...current, { id: crypto.randomUUID(), name: "" }])}
                  className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container-low"
                >
                  <Icon name="add" className="text-[18px]" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      {error ? <p className="md:col-span-2 font-body-sm text-body-sm text-error" role="alert">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving" : submitLabel}</Button>
      </div>
    </form>
  );
}
