import Destination from "../models/destination.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });

    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Destinations fetched successfully",
      {
        destinations,
      },
    );
  } catch (error) {
    console.error("Get destinations error:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return sendError(
        res,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        "Validation failed",
        errors,
      );
    }

    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
    );
  }
};
