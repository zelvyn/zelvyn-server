import {
  signupUserService,
  googleAuthService,
  loginUserService,
} from "../services/auth.services.js";
import { handleResponseWithCookie } from "../utils/helperFunctions.js";

export const signupUserController = async (req, res) => {
  handleResponseWithCookie(signupUserService, req, res);
};

export const loginUserController = async (req, res) => {
  handleResponseWithCookie(loginUserService, req, res);
};

export const googleAuthController = async (req, res) => {
  handleResponseWithCookie(googleAuthService, req, res);
};
