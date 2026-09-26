import { api } from "@/lib/api";
import type { CreateProfileInput, Profile } from "@/lib/types";

type ProfileResponse = { success: boolean; profile: Profile };

export function createProfile(input: CreateProfileInput) {
  return api<ProfileResponse>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
