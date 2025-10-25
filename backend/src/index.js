import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/auth.route.js";
import surveyRoutes from "./routes/survey.route.js";
import aiRoutes from "./routes/ai.route.js";
import websiteRoutes from "./routes/website.route.js";
import kaggleRoutes from "./routes/kaggle.route.js";

import { connectDB } from "./lib/db.js";
import aiService from "./services/ai.service.js";

dotenv.config()


const PORT = process.env.PORT
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
const EXT_ID = "habefdkmdmmebkomcpiljcmkhdopnaej";
app.use(cors({ origin: true, credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/survey", surveyRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/website", websiteRoutes);
app.use("/api/kaggle", kaggleRoutes);


server.listen(PORT, async () => {
    console.log("Server is running on port:" + PORT);
    connectDB();
    
    // Initialize AI service
    try {
        console.log("Initializing AI service...");
        await aiService.initialize();
        console.log("AI service initialized successfully");
    } catch (err) {
        console.error("Failed to initialize AI service:", err);
        console.error("Website analysis features may not work properly");
    }
});