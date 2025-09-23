import {
  signupUserService,
  googleAuthService,
} from "../services/auth.services.js";
import { handleResponse } from "../utils/helperFunctions.js";

export const signupUserController = async (req, res) => {
  handleResponse(signupUserService, req, res);
};

export const googleAuthController = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required",
    });
  }

  return handleResponse(() => googleAuthService(token), req, res);
};
