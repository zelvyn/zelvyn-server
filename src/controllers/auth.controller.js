import {
  signupUserService,
  googleAuthService,
  loginUserService,
  forgotPasswordService,
  verifyOTPService,
  resetPasswordService,
  sendVerificationEmailService,
  verifyEmailService,
} from "../services/auth.services.js";
import {
  handleResponseWithCookie,
  handleResponse,
} from "../utils/helperFunctions.js";

export const signupUserController = async (req, res) => {
  handleResponseWithCookie(signupUserService, req, res);
};

export const loginUserController = async (req, res) => {
  handleResponseWithCookie(loginUserService, req, res);
};

export const googleAuthController = async (req, res) => {
  handleResponseWithCookie(googleAuthService, req, res);
};

export const forgotPasswordController = async (req, res) => {
  handleResponse(forgotPasswordService, req, res);
};

export const verifyOTPController = async (req, res) => {
  handleResponse(verifyOTPService, req, res);
};

export const resetPasswordController = async (req, res) => {
  handleResponse(resetPasswordService, req, res);
};

export const sendVerificationEmailController = async (req, res) => {
  handleResponse(sendVerificationEmailService, req, res);
};

export const verifyEmailController = async (req, res) => {
  handleResponse(verifyEmailService, req, res);
};
