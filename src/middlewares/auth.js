import jwt from "jsonwebtoken";
import { findAll } from "../db";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Check if the Authorization header is provided
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access Denied. No Authorization Header Provided." });
  }

  // Extract the token after "Bearer"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No Token Provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token with the secret key

    // Check if the user exists and if the user is deleted using email
    const user = await findAll("users", "email = $1", [decoded.email]);

    if (user[0]?.deleted) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }

    req.user = decoded; // Attach user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};
