import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import userRouter from "./routes/userRoute.js";
import fileUploadRouter from "./routes/fileUploadRouter.js";
import projectRouter from "./routes/projectRoute.js";
import requestRouter from "./routes/requestRoute.js";
import chatMessageRouter from "./routes/chatMessageRoute.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === "production"
        ? [
            "https://collab-dev.vercel.app",
            /https:\/\/.*-narges-hearis-projects\.vercel\.app$/
        ]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());
app.get("/", (req, res) => {
    res.send("Server is running");
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userProfileImagesPath = join(__dirname, "public/userProfileImages");
app.use("/public/userProfileImages/", express.static(userProfileImagesPath));
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/user/", userRouter);
app.use("/api/v1/files/", fileUploadRouter);
app.use("/api/v1/project/", projectRouter);
app.use("/api/v1/request/", requestRouter);
app.use("/api/v1/chatMessage/", chatMessageRouter);
export default app;
