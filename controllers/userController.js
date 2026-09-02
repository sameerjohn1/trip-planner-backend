import bcrypt from "bcryptjs";

import User from "../models/user.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import { sendSuccess, sendError } from "../utils/response.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check request body
    if (!req.body) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Request body is required",
      );
    }

    // Required fields
    if (!name || !email || !password) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Name, email and password are required",
      );
    }

    // Name validation
    if (typeof name !== "string" || name.trim().length < 2) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Name must be at least 2 characters long",
      );
    }

    if (name.trim().length > 50) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Name cannot exceed 50 characters",
      );
    }

    // Email validation
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Please provide a valid email address",
      );
    }

    // Password validation
    if (typeof password !== "string") {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Password must be a string",
      );
    }

    if (password.length < 6) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Password must be at least 6 characters long",
      );
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return sendError(
        res,
        HTTP_STATUS.CONFLICT,
        "A user with this email already exists",
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return sendSuccess(
      res,
      HTTP_STATUS.CREATED,
      "User registered successfully",
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    );
  } catch (error) {
    console.error("Register user error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return sendError(
        res,
        HTTP_STATUS.CONFLICT,
        "A user with this email already exists",
      );
    }

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

// login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check request body
    if (!req.body) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Request body is required",
      );
    }

    // Required fields
    if (!email || !password) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Email and password are required",
      );
    }

    // Email validation
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Please provide a valid email address",
      );
    }

    // Password type check
    if (typeof password !== "string") {
      return sendError(
        res,
        HTTP_STATUS.BAD_REQUEST,
        "Password must be a string",
      );
    }

    // Find user — explicitly select password since schema has select:false
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    // Same error for "not found" and "wrong password" — avoids leaking
    // which emails are registered (basic security best practice)
    if (!user) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    // Check account status
    if (!user.isActive) {
      return sendError(
        res,
        HTTP_STATUS.FORBIDDEN,
        "This account has been deactivated",
      );
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return sendError(
        res,
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid email or password",
      );
    }

    // Generate JWT
    const token = generateToken(user._id);

    return sendSuccess(res, HTTP_STATUS.OK, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login user error:", error);

    return sendError(
      res,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      "Internal server error",
    );
  }
};
