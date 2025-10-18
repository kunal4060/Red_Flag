import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";

import authRoutes from "./routes/auth.route.js";
import surveyRoutes from "./routes/survey.route.js";
import aiRoutes from "./routes/ai.route.js";
import websiteRoutes from "./routes/website.route.js";

import { connectDB } from "./lib/db.js";

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


server.listen(PORT, () => {
    console.log("Server is running on port:" + PORT)
    connectDB()
});