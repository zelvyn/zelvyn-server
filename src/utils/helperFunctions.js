export const sendError = (statusCode, message, errors = null) => ({
  status: statusCode,
  data: {
    success: false,
    message,
    ...(errors && { errors }),
  },
});

export const sendSuccess = (statusCode, data, message = "Success") => ({
  status: statusCode,
  data: {
    success: true,
    message,
    data,
  },
});

export const checkMissingFields = (fields, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !fields[field]);
  return missingFields.length > 0
    ? sendError(400, `Missing required fields: ${missingFields.join(", ")}`)
    : null;
};

export const handleResponse = async (service, req, res) => {
  try {
    const requestData = getRequestData(req);

    if (!requestData && ["POST", "PUT", "PATCH"].includes(req.method)) {
      return res
        .status(400)
        .json(sendError(400, "Request body cannot be empty"));
    }

    const result = await service(requestData);
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Operation failed:", error);
    return res
      .status(500)
      .json(
        sendError(
          500,
          "An unexpected error occurred",
          process.env.NODE_ENV === "development" ? error.message : undefined
        )
      );
  }
};

const getRequestData = (req) => {
  switch (req.method) {
    case "GET":
      return Object.keys(req.query).length ? req.query : null;
    case "POST":
    case "PUT":
    case "PATCH":
      return Object.keys(req.body).length ? req.body : null;
    default:
      return null;
  }
};

export const handleResponseWithCookie = async (service, req, res) => {
  try {
    const requestData = getRequestData(req);

    if (!requestData && ["POST", "PUT", "PATCH"].includes(req.method)) {
      return res
        .status(400)
        .json(sendError(400, "Request body cannot be empty"));
    }

    const result = await service(requestData);

    if (result.token) {
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    console.error("Operation failed:", error);
    return res
      .status(500)
      .json(
        sendError(
          500,
          "An unexpected error occurred",
          process.env.NODE_ENV === "development" ? error.message : undefined
        )
      );
  }
};
