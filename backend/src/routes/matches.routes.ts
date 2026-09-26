import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateBody } from "../middleware/validate";
import { analyzeProfile, getMatchDetail } from "../services/matching.service";

const analyzeSchema = z.object({
  profileId: z.string().uuid("profileId is required"),
  story: z.string().max(8000).optional(),
  futureIntent: z.string().max(4000).optional(),
});

const detailQuerySchema = z.object({
  story: z.string().max(4000).optional(),
  futureIntent: z.string().max(2000).optional(),
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
    const { profileId, story, futureIntent } = req.body as z.infer<typeof analyzeSchema>;
    const result = await analyzeProfile(profileId, { story, futureIntent });
    res.json({
      success: true,
      profileId,
      matches: result.matches,
      totalRelevant: result.totalRelevant,
      matchThreshold: result.matchThreshold,
      totalTime: result.totalTime,
      processedSchemes: result.processedSchemes,
      websiteStatus: result.websiteStatus,
      websiteNotice: result.websiteNotice,
      conflicts: result.conflicts,
      missingFields: result.missingFields,
      informationStatus: result.informationStatus,
      unifiedProfile: result.unifiedProfile,
      ...(result.fallbackMode
        ? {
            fallbackMode: true,
            fallbackReason: result.fallbackReason,
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
    const query = detailQuerySchema.safeParse({
      story: typeof req.query.story === "string" ? req.query.story : undefined,
      futureIntent: typeof req.query.futureIntent === "string" ? req.query.futureIntent : undefined,
    });
    const match = await getMatchDetail(params.data.profileId, params.data.schemeId, query.success ? query.data : {});
    res.json({ success: true, match });
  }),
);
