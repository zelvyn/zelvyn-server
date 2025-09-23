import {
  checkMissingFields,
  sendError,
  sendSuccess,
} from "../utils/helperFunctions.js";
import { EMAIL_REGEX, PASSWORD_REGEX } from "../utils/regexs.js";
import { ROLES } from "../utils/role&Respo.js";
import { OAuth2Client } from "google-auth-library";
import { insert, findAll } from "../db/index.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload();

    // Check if user exists
    const existingUser = await findAll("users", "email = $1", [email]);

    if (existingUser.length > 0) {
      return sendSuccess(200, existingUser[0], "Login successful");
    }

    // Create new user
    const newUser = await insert("users", {
      email,
      name,
      profile_image: picture,
      google_id: googleId,
      is_google_user: true,
    });

    return sendSuccess(201, newUser, "User created successfully");
  } catch (error) {
    return sendError(401, "Invalid Google token");
  }
};

export const signupUserService = async (userData) => {
  try {
    const { name, email, password, userName, userType } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "name",
      "email",
      "password",
      "userName",
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
      "email = $1 or userName = $2",
      [userName, email]
    );
    if (existingUsers.length > 0) {
      return {
        status: 409,
        data: { error: "User with the same username or email already exists." },
      };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: encryptedPassword,
      userName,
      userType,
    };

    const createdUser = await insert("users", newUser);
    delete createdUser.password; // Remove password before sending response

    return { status: 201, data: { user: createdUser } };
  } catch (error) {
    console.error("Error in creating a user:", error);
    return sendError(500, "Internal server error.");
  }
};
