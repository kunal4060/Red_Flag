import express from "express";
import { analyzeBatch } from "../controllers/kaggle.controller.js";

const router = express.Router();

router.post("/analyze-batch", analyzeBatch);

export default router;
