import dotenv from "dotenv";
// Initialize environment variables first
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import messagingRouter from "./routes/messaging.routes.js";

const app = express();
const port = process.env.PORT || 8080;

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "https://zelvyn.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Router Registry
app.use("/api/auth", authRouter);
app.use("/api/messaging", messagingRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Zelvyn API" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
});
