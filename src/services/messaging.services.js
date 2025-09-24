import { sendError, sendSuccess } from "../utils/helperFunctions.js";
import { sendEmail } from "../utils/messaging/mailer.js";

// Email channel service
export const sendEmailService = async ({ to, subject, text, html }) => {
  try {
    const result = await sendEmail({ to, subject, text, html });

    if (result.success) {
      return sendSuccess(200, result.data, "Email sent successfully");
    } else {
      return sendError(500, "Failed to send email", result.error);
    }
  } catch (error) {
    return sendError(500, "Email service error", error.message);
  }
};

// Welcome email template service
export const sendWelcomeEmailService = async ({ email, name }) => {
  try {
    const result = await sendEmail({
      to: email,
      subject: "Welcome to Zelvyn!",
      text: `Hello ${name},\n\nWelcome to Zelvyn! Your account has been created successfully.\n\nBest regards,\nZelvyn Team`,
      html: `
        <h2>Welcome to Zelvyn!</h2>
        <p>Hello ${name},</p>
        <p>Welcome to Zelvyn! Your account has been created successfully.</p>
        <p>Best regards,<br>Zelvyn Team</p>
      `,
    });

    if (result.success) {
      return sendSuccess(200, "Welcome email sent successfully");
    } else {
      return sendError(500, "Failed to send welcome email", result.error);
    }
  } catch (error) {
    return sendError(500, "Welcome email service error", error.message);
  }
};

// Future: SMS service placeholder
export const sendSMSService = async ({ to, message }) => {
  // TODO: Implement SMS service (Twilio, etc.)
  console.log(to, message);

  return sendError(501, "SMS service not implemented yet");
};

// Future: Push notification service placeholder
export const sendPushNotificationService = async ({ to, title, body }) => {
  console.log(to, title, body);

  // TODO: Implement push notification service (Firebase, etc.)
  return sendError(501, "Push notification service not implemented yet");
};
