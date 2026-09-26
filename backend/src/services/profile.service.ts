import { insertProfile } from "../repositories/profile.repository";
import { CreateProfileInput, Profile } from "../types/profile.types";

export function createProfile(input: CreateProfileInput): Promise<Profile> {
  return insertProfile(input);
}
