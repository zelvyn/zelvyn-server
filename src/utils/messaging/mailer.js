import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: `"Zelvyn" <${process.env.BREVO_FROM_EMAIL}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      ...(html && { html }),
    };

    const data = await transporter.sendMail(mailOptions);

    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  return await sendEmail({
    to: userEmail,
    subject: "Welcome to Zelvyn!",
    text: `Hello ${userName},\n\nWelcome to Zelvyn! Your account has been created successfully.\n\nBest regards,\nZelvyn Team`,
    html: `
      <h2>Welcome to Zelvyn!</h2>
      <p>Hello ${userName},</p>
      <p>Welcome to Zelvyn! Your account has been created successfully.</p>
      <p>Best regards,<br>Zelvyn Team</p>
    `,
  });
};

export const sendOTPEmail = async (userEmail, otp, type = 'email_verification') => {
  const subjects = {
    email_verification: 'Verify Your Email - Zelvyn',
    password_reset: 'Reset Your Password - Zelvyn'
  };
  
  const messages = {
    email_verification: {
      text: `Your email verification OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nBest regards,\nZelvyn Team`,
      html: `<h2>Email Verification</h2><p>Your verification OTP is:</p><h1 style="color: #007bff;">${otp}</h1><p>This OTP will expire in 10 minutes.</p><p>Best regards,<br>Zelvyn Team</p>`
    },
    password_reset: {
      text: `Your password reset OTP is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nBest regards,\nZelvyn Team`,
      html: `<h2>Password Reset</h2><p>Your password reset OTP is:</p><h1 style="color: #007bff;">${otp}</h1><p>This OTP will expire in 10 minutes.</p><p>Best regards,<br>Zelvyn Team</p>`
    }
  };
  
  return await sendEmail({
    to: userEmail,
    subject: subjects[type],
    text: messages[type].text,
    html: messages[type].html,
  });
};
