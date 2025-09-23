import { checkMissingFields, sendError } from "../utils/helperFunctions.js";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../utils/regexs.js";
import { ROLES } from "../utils/role&Respo.js";
import { OAuth2Client } from "google-auth-library";
import { insert, findAll, updateSql } from "../db/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      user_type: userType || "USER",
      email_verified: true,
      last_login: new Date(),
      google_access_token: token,
    });

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
