import {
  createArtistProfileService,
  getArtistProfileService,
  updateArtistProfileService,
  deleteArtistProfileService,
  getAllArtistProfilesService,
  createCustomerProfileService,
  getCustomerProfileService,
  updateCustomerProfileService,
  deleteCustomerProfileService,
} from "../services/profile.services.js";
import { handleResponse } from "../utils/helperFunctions.js";

// Artist Profile Controllers
export const createArtistProfileController = async (req, res) => {
  handleResponse(createArtistProfileService, req, res);
};

export const getArtistProfileController = async (req, res) => {
  const requestData = { artistId: req.params.artistId };
  const result = await getArtistProfileService(requestData);
  return res.status(result.status).json(result.data);
};

export const updateArtistProfileController = async (req, res) => {
  const requestData = { ...req.body, userId: req.params.userId };
  const result = await updateArtistProfileService(requestData);
  return res.status(result.status).json(result.data);
};

export const deleteArtistProfileController = async (req, res) => {
  const requestData = { userId: req.params.userId };
  const result = await deleteArtistProfileService(requestData);
  return res.status(result.status).json(result.data);
};

export const getAllArtistProfilesController = async (req, res) => {
  const result = await getAllArtistProfilesService();
  return res.status(result.status).json(result.data);
};

// Customer Profile Controllers
export const createCustomerProfileController = async (req, res) => {
  handleResponse(createCustomerProfileService, req, res);
};

export const getCustomerProfileController = async (req, res) => {
  const requestData = { userId: req.params.userId };
  const result = await getCustomerProfileService(requestData);
  return res.status(result.status).json(result.data);
};

export const updateCustomerProfileController = async (req, res) => {
  const requestData = { ...req.body, userId: req.params.userId };
  const result = await updateCustomerProfileService(requestData);
  return res.status(result.status).json(result.data);
};

export const deleteCustomerProfileController = async (req, res) => {
  const requestData = { userId: req.params.userId };
  const result = await deleteCustomerProfileService(requestData);
  return res.status(result.status).json(result.data);
};
