import { z } from "zod";
import {
  FOUNDER_EXPERIENCE,
  GST_STATUSES,
  PROFILE_LOCATIONS,
  SECTORS,
  STAGES,
  type FounderExperience,
  type GstStatus,
  type ProfileLocation,
  type Sector,
  type Stage,
} from "./shared.types";

function enumField<T extends string>(values: readonly T[], message: string) {
  return z.enum(values as unknown as [T, ...T[]], {
    errorMap: () => ({ message }),
  });
}

export const createProfileSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters"),
  sector: enumField(SECTORS, "Invalid sector"),
  stage: enumField(STAGES, "Invalid stage"),
  location: enumField(PROFILE_LOCATIONS, "Invalid location"),
  fundingNeeded: z
    .number({
      required_error: "Must be a positive number",
      invalid_type_error: "Must be a positive number",
    })
    .int("Must be a positive number")
    .positive("Must be a positive number"),
  founderExperience: enumField(FOUNDER_EXPERIENCE, "Invalid founder experience"),
  incorporationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a YYYY-MM-DD date")
    .optional(),
  gstStatus: enumField(GST_STATUSES, "Invalid GST status").optional(),
  dpiitRegistration: z.boolean().optional(),
  previousFunding: z
    .number()
    .int("Must be a non-negative number")
    .nonnegative("Must be a non-negative number")
    .optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

export type Profile = {
  id: string;
  name: string;
  sector: Sector;
  stage: Stage;
  location: ProfileLocation;
  fundingNeeded: number;
  founderExperience: FounderExperience;
  incorporationDate: string | null;
  gstStatus: GstStatus | null;
  dpiitRegistration: boolean;
  previousFunding: number;
  createdAt: string;
};
