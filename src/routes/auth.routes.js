import express from "express";
import {
  signupUserController,
  loginUserController,
  googleAuthController,
  forgotPasswordController,
  resetPasswordController,
  sendVerificationEmailController,
  verifyEmailController,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// Authentication routes
authRouter.post("/signup", signupUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/google", googleAuthController);

// Password reset routes
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/reset-password", resetPasswordController);

// Email verification routes
authRouter.post("/send-verification", sendVerificationEmailController);
authRouter.post("/verify-email", verifyEmailController);

export default authRouter;
