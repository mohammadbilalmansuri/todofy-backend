import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import todoRoutes from "./routes/todo.routes.js";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`Request from IP: ${req.ip}`);
  next();
});

// API Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/todos", todoRoutes);

// Error Handler Middleware
app.use(globalErrorHandler);

export default app;
