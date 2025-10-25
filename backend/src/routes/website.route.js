import express from "express";
import { analyzeWebsite, fetchLinks } from "../controllers/website.controller.js";

const router = express.Router();

router.post("/analyze", analyzeWebsite);
router.post("/fetch-links", fetchLinks);

export default router;