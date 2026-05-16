import express from "express";
import cors from "cors";
import passport from "./config/passport";
import authRoute from "./routes/authRoute";
import categoryRoute from "./routes/categoryRoute";
import taskRoute from "./routes/taskRoute";
import subtaskRoute from "./routes/subtaskRoute";
import tagRoute from "./routes/tagRoute";
import dashboardRoute from "./routes/dashboardRoute";
import adminRoute from "./routes/adminRoute";
import profileRouter from "./routes/profileRouter";
import path from "path";
import cookieParser from "cookie-parser";
import notificationRoute from "./routes/notificationRoute";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "",
      "https://softwhere.online",
      "https://www.softwhere.online",
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth", authRoute);

app.use("/api/categories", categoryRoute);

app.use("/api/tasks", taskRoute);

app.use("/api/subtasks", subtaskRoute);

app.use("/api/tags", tagRoute);

app.use("/api/dashboard", dashboardRoute);

app.use("/api/admin", adminRoute);

app.use("/api/profile", profileRouter);

app.use("/api/notifications", notificationRoute);
export default app;
