import { checkMissingFields, sendError } from "../utils/helperFunctions.js";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../utils/regexs.js";
import { ROLES } from "../utils/role&Respo.js";
import { OAuth2Client } from "google-auth-library";
import { insert, findAll, updateSql } from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendOTPEmail } from "../utils/messaging/mailer.js";
import { generateOTP, storeOTP, verifyOTP } from "../utils/otpStore.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = async ({ token, userType }) => {
  console.log("Google Auth Service called", token, userType);

  try {
    // Validate userType if provided
    if (userType && !ROLES.includes(userType)) {
      return sendError(400, "Invalid user type.");
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // Check if user exists
    const existingUser = await findAll("users", "email = $1", [email]);

    let user;
    let jwtToken;

    if (existingUser.length > 0) {
      // Update existing user with tokens and last_login
      await updateSql(
        "users",
        {
          last_login: new Date(),
          email_verified: true,
          google_access_token: token,
          user_type: userType || existingUser[0].user_type,
        },
        "id = $1",
        [existingUser[0].id]
      );
      user = existingUser[0];

      // Generate JWT token for existing user
      jwtToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          user_type: userType || user.user_type,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return {
        status: 200,
        data: { success: true, message: "Login successful", data: user },
        token: jwtToken,
      };
    }

    // Create new user
    const newUser = await insert("users", {
      email,
      name,
      profile_image: picture,
      google_id: googleId,
      provider: "GOOGLE",
      username: email.split("@")[0],
      user_type: userType || "USER",
      email_verified: true,
      last_login: new Date(),
      google_access_token: token,
    });

    // Send welcome email for new Google users (don't wait for it)
    sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    // Generate JWT token for new user
    jwtToken = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        user_type: newUser.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return {
      status: 201,
      data: {
        success: true,
        message: "User created successfully",
        data: newUser,
      },
      token: jwtToken,
    };
  } catch (error) {
    return sendError(401, "Invalid Google token");
  }
};

export const loginUserService = async (userData) => {
  try {
    const { email, password } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "email",
      "password",
    ]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Find user by email
    const existingUsers = await findAll("users", "email = $1", [email]);
    if (existingUsers.length === 0) {
      return { status: 401, data: { error: "Invalid email or password." } };
    }

    const user = existingUsers[0];

    // Check if user is active
    if (!user.is_active) {
      return { status: 403, data: { error: "Account is inactive." } };
    }

    // Check if user has password (might be Google user)
    if (!user.password_hash) {
      return { status: 401, data: { error: "Invalid email or password." } };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return { status: 401, data: { error: "Invalid email or password." } };
    }

    // Update last_login
    await updateSql("users", { last_login: new Date() }, "id = $1", [user.id]);

    delete user.password_hash;

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return {
      status: 200,
      data: { success: true, message: "Login successful", data: user },
      token,
    };
  } catch (error) {
    console.error("Error in login:", error);
    return sendError(500, "Internal server error.");
  }
};

export const forgotPasswordService = async (userData) => {
  try {
    const { email } = userData;
    const missingFieldsError = checkMissingFields(userData, ["email"]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Check if user exists
    const existingUsers = await findAll("users", "email = $1", [email]);
    if (existingUsers.length === 0) {
      return { status: 404, data: { error: "User not found." } };
    }

    const user = existingUsers[0];

    // Check if user has password (not Google user)
    if (!user.password_hash) {
      return {
        status: 400,
        data: {
          error:
            "This account uses Google sign-in. Please use Google to login.",
        },
      };
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, "password_reset");

    // Send OTP email
    await sendOTPEmail(email, otp, "password_reset");

    return {
      status: 200,
      data: {
        success: true,
        message: "Password reset OTP sent to your email.",
      },
    };
  } catch (error) {
    console.error("Error in forgot password:", error);
    return sendError(500, "Internal server error.");
  }
};

export const resetPasswordService = async (userData) => {
  try {
    const { email, otp, newPassword, confirmPassword } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "email",
      "otp",
      "newPassword",
      "confirmPassword",
    ]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    if (newPassword !== confirmPassword) {
      return { status: 400, data: { error: "Passwords do not match." } };
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return {
        status: 400,
        data: { error: "Password must be at least 6 characters long." },
      };
    }

    // Verify OTP
    if (!verifyOTP(email, otp, "password_reset")) {
      return { status: 400, data: { error: "Invalid or expired OTP." } };
    }

    // Check if user exists
    const existingUsers = await findAll("users", "email = $1", [email]);
    if (existingUsers.length === 0) {
      return { status: 404, data: { error: "User not found." } };
    }

    // Hash new password and update
    const password_hash = await bcrypt.hash(newPassword, 10);
    await updateSql("users", { password_hash }, "email = $1", [email]);

    return {
      status: 200,
      data: { success: true, message: "Password reset successfully." },
    };
  } catch (error) {
    console.error("Error in reset password:", error);
    return sendError(500, "Internal server error.");
  }
};

export const sendVerificationEmailService = async (userData) => {
  try {
    const { email } = userData;
    const missingFieldsError = checkMissingFields(userData, ["email"]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Check if user exists
    const existingUsers = await findAll("users", "email = $1", [email]);
    if (existingUsers.length === 0) {
      return { status: 404, data: { error: "User not found." } };
    }

    const user = existingUsers[0];
    if (user.email_verified) {
      return { status: 400, data: { error: "Email is already verified." } };
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp, "email_verification");

    // Send OTP email
    await sendOTPEmail(email, otp, "email_verification");

    return {
      status: 200,
      data: { success: true, message: "Verification OTP sent to your email." },
    };
  } catch (error) {
    console.error("Error in send verification email:", error);
    return sendError(500, "Internal server error.");
  }
};

export const verifyEmailService = async (userData) => {
  try {
    const { email, otp } = userData;
    const missingFieldsError = checkMissingFields(userData, ["email", "otp"]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Verify OTP
    if (!verifyOTP(email, otp, "email_verification")) {
      return { status: 400, data: { error: "Invalid or expired OTP." } };
    }

    // Update user email verification status
    await updateSql("users", { email_verified: true }, "email = $1", [email]);

    return {
      status: 200,
      data: { success: true, message: "Email verified successfully." },
    };
  } catch (error) {
    console.error("Error in verify email:", error);
    return sendError(500, "Internal server error.");
  }
};

export const signupUserService = async (userData) => {
  try {
    const { name, email, password, userName, userType, phone } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "name",
      "email",
      "password",
      "userType",
    ]);
    if (missingFieldsError) {
      return missingFieldsError;
    }
    if (!EMAIL_REGEX.test(email)) {
      return { status: 400, data: { error: "Invalid email format." } };
    }
    if (!PASSWORD_REGEX.test(password)) {
      return {
        status: 400,
        data: { error: "Password must be at least 6 characters long." },
      };
    }
    if (!ROLES.includes(userType)) {
      return { status: 400, data: { error: "Invalid user type." } };
    }

    // Check if the user already exists
    const existingUsers = await findAll(
      "users",
      "email = $1 or username = $2",
      [email, userName]
    );
    if (existingUsers.length > 0) {
      return {
        status: 409,
        data: { error: "User with the same username or email already exists." },
      };
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password_hash,
      username: userName || email.split("@")[0],
      user_type: userType,
      phone,
      provider: "LOCAL",
      is_active: true,
      email_verified: false,
    };

    const createdUser = await insert("users", newUser);
    delete createdUser.password_hash;

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(createdUser.email, createdUser.name).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    // Generate JWT token for auto-login
    const token = jwt.sign(
      {
        id: createdUser.id,
        email: createdUser.email,
        user_type: createdUser.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { status: 201, data: { user: createdUser }, token };
  } catch (error) {
    console.error("Error in creating a user:", error);
    return sendError(500, "Internal server error.");
  }
};
