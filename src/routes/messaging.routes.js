import express from "express";
import {
  sendEmailController,
  sendWelcomeEmailController,
  sendSMSController,
  sendPushNotificationController,
} from "../controllers/messaging.controller.js";

const messagingRouter = express.Router();

// Email routes
messagingRouter.post("/email", sendEmailController);
messagingRouter.post("/email/welcome", sendWelcomeEmailController);

// Future SMS routes
messagingRouter.post("/sms", sendSMSController);

// Future push notification routes
messagingRouter.post("/push", sendPushNotificationController);

export default messagingRouter;
