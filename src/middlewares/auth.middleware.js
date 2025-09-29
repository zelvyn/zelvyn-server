import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { findAll } from "../db/index.js";
import { sendError } from "../utils/helperFunctions.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json(sendError(401, "Access token required"));
    }

    let userEmail;
    let userId;

    // Try JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userEmail = decoded.email;
      userId = decoded.id;
    } catch (jwtError) {
      // If JWT fails, try Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      userEmail = ticket.getPayload().email;

      // Get user ID from database for Google tokens
      const user = await findAll("users", "email = $1", [userEmail]);
      if (user.length === 0) {
        return res.status(404).json(sendError(404, "User not found"));
      }
      userId = user[0].id;
    }

    // Check user exists and is active
    const user = await findAll("users", "email = $1", [userEmail]);

    if (user.length === 0) {
      return res.status(404).json(sendError(404, "User not found"));
    }

    if (!user[0].is_active) {
      return res.status(403).json(sendError(403, "Account is inactive"));
    }

    req.user = { id: userId, email: userEmail, ...user[0] };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(403).json(sendError(403, "Invalid or expired token"));
  }
};

export const authorizeOwner = (req, res, next) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res
        .status(403)
        .json(
          sendError(403, "Access denied. You can only access your own profile")
        );
    }

    next();
  } catch (error) {
    return res.status(500).json(sendError(500, "Authorization error"));
  }
};
