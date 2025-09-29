import {
  checkMissingFields,
  sendError,
  sendSuccess,
} from "../utils/helperFunctions.js";
import {
  insert,
  findAll,
  updateSql,
  deleteSql,
  executeRawQuery,
} from "../db/index.js";

// Artist Profile Services
export const createArtistProfileService = async (userData) => {
  try {
    const {
      userId,
      displayName,
      bio,
      skills,
      categories,
      portfolioLinks,
      socialLinks,
    } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "userId",
      "displayName",
    ]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Check if user exists
    const existingUser = await findAll("users", "id = $1", [userId]);
    if (existingUser.length === 0) {
      return sendError(404, "User not found.");
    }

    // Check if artist profile already exists
    const existingProfile = await findAll("artist_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length > 0) {
      return sendError(409, "Artist profile already exists for this user.");
    }

    const profileData = {
      user_id: userId,
      display_name: displayName,
      bio,
      skills: skills || [],
      categories: categories || [],
      portfolio_links: portfolioLinks || [],
      social_links: socialLinks || {},
    };

    const newProfile = await insert("artist_profiles", profileData);
    return sendSuccess(201, newProfile, "Artist profile created successfully");
  } catch (error) {
    console.error("Error creating artist profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const getArtistProfileService = async (userData) => {
  try {
    const { artistId } = userData;
    if (!artistId) {
      return sendError(400, "Artist ID is required.");
    }

    const query = `
      SELECT u.name, u.email, u.profile_image, u.created_at as user_created_at,
             a.artist_id, a.display_name, a.bio, a.skills, a.categories, 
             a.portfolio_links, a.social_links, a.created_at, a.updated_at
      FROM users u
      JOIN artist_profiles a ON u.id = a.user_id
      WHERE a.artist_id = $1
    `;

    const result = await executeRawQuery(query, [artistId]);
    if (result.length === 0) {
      return sendError(404, "Artist profile not found.");
    }

    const profile = result[0];
    const responseData = {
      artistId: profile.artist_id,
      displayName: profile.display_name,
      bio: profile.bio,
      skills: profile.skills,
      categories: profile.categories,
      portfolioLinks: profile.portfolio_links,
      socialLinks: profile.social_links,
      profileImage: profile.profile_image,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      userCreatedAt: profile.user_created_at,
    };

    return sendSuccess(
      200,
      responseData,
      "Artist profile retrieved successfully"
    );
  } catch (error) {
    console.error("Error getting artist profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const updateArtistProfileService = async (userData) => {
  try {
    const {
      userId,
      displayName,
      bio,
      skills,
      categories,
      portfolioLinks,
      socialLinks,
    } = userData;
    if (!userId) {
      return sendError(400, "User ID is required.");
    }

    // Check if profile exists
    const existingProfile = await findAll("artist_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length === 0) {
      return sendError(404, "Artist profile not found.");
    }

    const updateData = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (categories !== undefined) updateData.categories = categories;
    if (portfolioLinks !== undefined)
      updateData.portfolio_links = portfolioLinks;
    if (socialLinks !== undefined) updateData.social_links = socialLinks;
    updateData.updated_at = new Date();

    await updateSql("artist_profiles", updateData, "user_id = $1", [userId]);

    const updatedProfile = await findAll("artist_profiles", "user_id = $1", [
      userId,
    ]);
    return sendSuccess(
      200,
      updatedProfile[0],
      "Artist profile updated successfully"
    );
  } catch (error) {
    console.error("Error updating artist profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const deleteArtistProfileService = async (userData) => {
  try {
    const { userId } = userData;
    if (!userId) {
      return sendError(400, "User ID is required.");
    }

    const existingProfile = await findAll("artist_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length === 0) {
      return sendError(404, "Artist profile not found.");
    }

    await deleteSql("artist_profiles", "user_id = $1", [userId]);
    return sendSuccess(200, null, "Artist profile deleted successfully");
  } catch (error) {
    console.error("Error deleting artist profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const getAllArtistProfilesService = async () => {
  try {
    const query = `
      SELECT u.name, u.profile_image, u.created_at as user_created_at,
             a.artist_id, a.display_name, a.bio, a.skills, a.categories, 
             a.portfolio_links, a.social_links, a.created_at, a.updated_at
      FROM users u
      JOIN artist_profiles a ON u.id = a.user_id
      ORDER BY a.created_at DESC
    `;

    const profiles = await executeRawQuery(query, []);

    const responseData = profiles.map((profile) => ({
      artistId: profile.artist_id,
      displayName: profile.display_name,
      bio: profile.bio,
      skills: profile.skills,
      categories: profile.categories,
      portfolioLinks: profile.portfolio_links,
      socialLinks: profile.social_links,
      profileImage: profile.profile_image,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }));

    return sendSuccess(
      200,
      responseData,
      "Artist profiles retrieved successfully"
    );
  } catch (error) {
    console.error("Error getting artist profiles:", error);
    return sendError(500, "Internal server error.");
  }
};

// Customer Profile Services
export const createCustomerProfileService = async (userData) => {
  try {
    const { userId, displayName, bio, interests, preferences } = userData;
    const missingFieldsError = checkMissingFields(userData, [
      "userId",
      "displayName",
    ]);
    if (missingFieldsError) {
      return missingFieldsError;
    }

    // Check if user exists
    const existingUser = await findAll("users", "id = $1", [userId]);
    if (existingUser.length === 0) {
      return sendError(404, "User not found.");
    }

    // Check if customer profile already exists
    const existingProfile = await findAll("customer_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length > 0) {
      return sendError(409, "Customer profile already exists for this user.");
    }

    const profileData = {
      user_id: userId,
      display_name: displayName,
      bio,
      interests: interests || [],
      preferences: preferences || {},
    };

    const newProfile = await insert("customer_profiles", profileData);
    return sendSuccess(
      201,
      newProfile,
      "Customer profile created successfully"
    );
  } catch (error) {
    console.error("Error creating customer profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const getCustomerProfileService = async (userData) => {
  try {
    const { userId } = userData;
    if (!userId) {
      return sendError(400, "User ID is required.");
    }

    const query = `
      SELECT u.name, u.email, u.profile_image, u.created_at as user_created_at,
             c.customer_id, c.display_name, c.bio, c.interests, c.preferences,
             c.created_at, c.updated_at
      FROM users u
      JOIN customer_profiles c ON u.id = c.user_id
      WHERE c.user_id = $1
    `;

    const result = await executeRawQuery(query, [userId]);
    if (result.length === 0) {
      return sendError(404, "Customer profile not found.");
    }

    const profile = result[0];
    const responseData = {
      customerId: profile.customer_id,
      displayName: profile.display_name,
      bio: profile.bio,
      interests: profile.interests,
      preferences: profile.preferences,
      profileImage: profile.profile_image,
      email: profile.email,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return sendSuccess(
      200,
      responseData,
      "Customer profile retrieved successfully"
    );
  } catch (error) {
    console.error("Error getting customer profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const updateCustomerProfileService = async (userData) => {
  try {
    const { userId, displayName, bio, interests, preferences } = userData;
    if (!userId) {
      return sendError(400, "User ID is required.");
    }

    // Check if profile exists
    const existingProfile = await findAll("customer_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length === 0) {
      return sendError(404, "Customer profile not found.");
    }

    const updateData = {};
    if (displayName !== undefined) updateData.display_name = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.interests = interests;
    if (preferences !== undefined) updateData.preferences = preferences;
    updateData.updated_at = new Date();

    await updateSql("customer_profiles", updateData, "user_id = $1", [userId]);

    const updatedProfile = await findAll("customer_profiles", "user_id = $1", [
      userId,
    ]);
    return sendSuccess(
      200,
      updatedProfile[0],
      "Customer profile updated successfully"
    );
  } catch (error) {
    console.error("Error updating customer profile:", error);
    return sendError(500, "Internal server error.");
  }
};

export const deleteCustomerProfileService = async (userData) => {
  try {
    const { userId } = userData;
    if (!userId) {
      return sendError(400, "User ID is required.");
    }

    const existingProfile = await findAll("customer_profiles", "user_id = $1", [
      userId,
    ]);
    if (existingProfile.length === 0) {
      return sendError(404, "Customer profile not found.");
    }

    await deleteSql("customer_profiles", "user_id = $1", [userId]);
    return sendSuccess(200, null, "Customer profile deleted successfully");
  } catch (error) {
    console.error("Error deleting customer profile:", error);
    return sendError(500, "Internal server error.");
  }
};
