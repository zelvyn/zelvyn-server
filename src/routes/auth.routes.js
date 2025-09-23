import express from "express";
import {
  signupUserController,
  googleAuthController,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signupUserController);
authRouter.post("/google", googleAuthController);

export default authRouter;
