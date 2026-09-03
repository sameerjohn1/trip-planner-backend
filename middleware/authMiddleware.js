import jwt from "jsonwebtoken";

import User from "../models/user.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { sendError } from "../utils/response.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authorized, no token provided",
      );
    }

    // Verify token signature and expiry
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return sendError(
          res,
          HTTP_STATUS.UNAUTHORIZED,
          "Session expired, please log in again",
        );
      }

      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authorized, invalid token",
      );
    }

    // Fetch user from decoded token id (excludes password by default)
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Not authorized, user no longer exists",
      );
    }

    if (!user.isActive) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        "This account has been deactivated",
      );
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Session has been logged out, please log in again",
      );
    }

    // Attach user to request object for use in downstream controllers
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
    );
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to perform this action",
      );
    }

    next();
  };
};
