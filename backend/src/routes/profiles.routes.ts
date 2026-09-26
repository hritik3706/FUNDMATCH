import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateBody } from "../middleware/validate";
import { createProfile } from "../services/profile.service";
import { createProfileSchema } from "../types/profile.types";

export const profileRouter = Router();

profileRouter.post(
  "/",
  validateBody(createProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await createProfile(req.body);
    res.status(201).json({ success: true, profile });
  }),
);
