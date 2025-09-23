import express from "express";
import {
  signupUserController,
  loginUserController,
  googleAuthController,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signupUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/google", googleAuthController);

export default authRouter;
