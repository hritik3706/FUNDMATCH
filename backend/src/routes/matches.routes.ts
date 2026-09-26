import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateBody } from "../middleware/validate";
import { analyzeProfile, getMatchDetail } from "../services/matching.service";

const analyzeSchema = z.object({
  profileId: z.string().uuid("profileId is required"),
});

const idParams = z.object({
  profileId: z.string().uuid(),
  schemeId: z.string().uuid(),
});

export const matchesRouter = Router();

matchesRouter.post(
  "/analyze",
  validateBody(analyzeSchema),
  asyncHandler(async (req, res) => {
    const { profileId } = req.body as z.infer<typeof analyzeSchema>;
    const result = await analyzeProfile(profileId);
    res.json({
      success: true,
      profileId,
      matches: result.matches,
      totalTime: result.totalTime,
      processedSchemes: result.processedSchemes,
      ...(result.fallbackMode
        ? {
            fallbackMode: true,
            fallbackReason:
              result.fallbackReason ??
              "Claude API temporarily unavailable. Using formula-based matching.",
          }
        : {}),
    });
  }),
);

matchesRouter.get(
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
    const match = await getMatchDetail(params.data.profileId, params.data.schemeId);
    res.json({ success: true, match });
  }),
);
