import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { generateActionPlan } from "../services/actionPlan.service";

const idParams = z.object({
  profileId: z.string().uuid(),
  schemeId: z.string().uuid(),
});

export const actionPlansRouter = Router();

actionPlansRouter.get(
  "/:profileId/:schemeId",
  asyncHandler(async (req, res) => {
    const params = idParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: { profileId: "profileId and schemeId must be UUIDs" },
      });
      return;
    }
    const actionPlan = await generateActionPlan(params.data.profileId, params.data.schemeId);
    res.json({
      success: true,
      actionPlan,
      ...(actionPlan.fallbackMode
        ? { fallbackMode: true, fallbackReason: actionPlan.fallbackReason }
        : {}),
    });
  }),
);
