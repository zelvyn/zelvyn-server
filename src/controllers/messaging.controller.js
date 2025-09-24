import {
  sendEmailService,
  sendWelcomeEmailService,
  sendSMSService,
  sendPushNotificationService,
} from "../services/messaging.services.js";
import { handleResponse } from "../utils/helperFunctions.js";

export const sendEmailController = async (req, res) => {
  handleResponse(sendEmailService, req, res);
};

export const sendWelcomeEmailController = async (req, res) => {
  handleResponse(sendWelcomeEmailService, req, res);
};

export const sendSMSController = async (req, res) => {
  handleResponse(sendSMSService, req, res);
};

export const sendPushNotificationController = async (req, res) => {
  handleResponse(sendPushNotificationService, req, res);
};