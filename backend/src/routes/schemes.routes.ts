import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getScheme, getSchemes } from "../services/scheme.service";

export const schemeRouter = Router();

schemeRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { schemes, totalCount } = await getSchemes();
    res.status(200).json({ success: true, schemes, totalCount });
  }),
);

schemeRouter.get(
  "/:schemeId",
  asyncHandler(async (req, res) => {
    const scheme = await getScheme(req.params.schemeId);
    res.status(200).json({ success: true, scheme });
  }),
);
