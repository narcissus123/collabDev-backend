import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import projectRouter from "./routes/projectRoute";
import requestRouter from "./routes/requestRoute";
import chatMessageRouter from "./routes/chatMessageRoute";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app: Express = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  })
);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const userProfileImagesPath = join(__dirname, "public/userProfileImages");
app.use("/public/userProfileImages/", express.static(userProfileImagesPath));

app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/user/", userRouter);
app.use("/api/v1/project/", projectRouter);
app.use("/api/v1/request/", requestRouter);
app.use("/api/v1/chatMessage/", chatMessageRouter);

export default app;
