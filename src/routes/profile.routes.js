import express from "express";
import {
  createArtistProfileController,
  getArtistProfileController,
  updateArtistProfileController,
  deleteArtistProfileController,
  getAllArtistProfilesController,
  createCustomerProfileController,
  getCustomerProfileController,
  updateCustomerProfileController,
  deleteCustomerProfileController,
} from "../controllers/profile.controller.js";
import {
  authenticate,
  authorizeOwner,
} from "../middlewares/auth.middleware.js";

const profileRouter = express.Router();

// Artist Profile Routes
profileRouter.get("/artists", getAllArtistProfilesController); // Public - Get all artist profiles
profileRouter.get("/artists/:artistId", getArtistProfileController); // Public - Get specific artist profile
profileRouter.post("/artists", authenticate, createArtistProfileController); // Private - Create artist profile
profileRouter.put(
  "/artists/:userId",
  authenticate,
  authorizeOwner,
  updateArtistProfileController
); // Private - Update artist profile
profileRouter.delete(
  "/artists/:userId",
  authenticate,
  authorizeOwner,
  deleteArtistProfileController
); // Private - Delete artist profile

// Customer Profile Routes (All Private)
profileRouter.post("/customers", authenticate, createCustomerProfileController); // Private - Create customer profile
profileRouter.get(
  "/customers/:userId",
  authenticate,
  authorizeOwner,
  getCustomerProfileController
); // Private - Get customer profile
profileRouter.put(
  "/customers/:userId",
  authenticate,
  authorizeOwner,
  updateCustomerProfileController
); // Private - Update customer profile
profileRouter.delete(
  "/customers/:userId",
  authenticate,
  authorizeOwner,
  deleteCustomerProfileController
); // Private - Delete customer profile

export default profileRouter;
