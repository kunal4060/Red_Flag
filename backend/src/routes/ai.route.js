// ...existing code...
import express from "express";
import { analyzeUrl } from "../controllers/ai.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// If you want only authenticated users to use model, keep protectRoute.
// For anonymous extension calls you can remove protectRoute.
router.post("/analyze", analyzeUrl);

export default router;