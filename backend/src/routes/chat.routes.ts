import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { HttpError } from "../middleware/httpError";
import { validateBody } from "../middleware/validate";
import { assertChatRate, handleAdvisorTurn } from "../services/chat/advisor.service";

const chatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1, "Write a message first.").max(2000, "Keep the message under 2000 characters."),
});

export const chatRouter = Router();

chatRouter.post(
  "/",
  validateBody(chatSchema),
  asyncHandler(async (req, res) => {
    const { conversationId, message } = req.body as z.infer<typeof chatSchema>;
    try {
      assertChatRate(req.ip || "local");
    } catch {
      throw new HttpError(429, "Too many requests", undefined, "Too many advisor messages. Wait a few minutes and try again.");
    }
    const result = await handleAdvisorTurn(conversationId, message);
    res.json({ success: true, ...result });
  }),
);
