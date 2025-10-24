import express from "express";
import { checkAuth, login, logout, signup, updatePlan, consumeToken, getTokenStatus, extensionLogin } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router =  express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/extension-login", extensionLogin);

router.post("/logout", logout);

router.get("/check", protectRoute, checkAuth);

router.put("/update-plan", protectRoute, updatePlan);

router.post("/consume-token", protectRoute, consumeToken);

router.get("/token-status", protectRoute, getTokenStatus);

export default router;