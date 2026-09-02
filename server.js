import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import authRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Connect to Database ----------
connectDB();

// ---------- Core Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Trip Maker API is running",
  });
});

// ---------- Auth Routes ----------
app.use("/auth", authRoutes);

// ---------- 404 Handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ---------- Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------- Start Server Locally ----------
if (process.env.NODE_ENV !== "production") {
  const server = app.listen(PORT, () => {
    console.log(
      `✅ Server running in ${
        process.env.NODE_ENV || "development"
      } mode on port ${PORT}`,
    );
  });

  // ---------- Handle Unhandled Promise Rejections ----------
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);

    server.close(() => process.exit(1));
  });
}

export default app;
