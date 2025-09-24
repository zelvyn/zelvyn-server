import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { findAll } from "../db";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access Denied. No Authorization Header Provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No Token Provided." });
  }

  try {
    let userEmail;

    // Try JWT first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userEmail = decoded.email;
    } catch (jwtError) {
      // If JWT fails, try Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      userEmail = ticket.getPayload().email;
    }

    // Check user exists and is active
    const user = await findAll("users", "email = $1", [userEmail]);

    if (!user[0]) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }

    if (!user[0].is_active) {
      return res.status(403).json({ message: "USER_INACTIVE" });
    }

    req.user = { email: userEmail, ...user[0] };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
