import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trip must belong to a user"],
    },
    title: {
      type: String,
      required: [true, "Trip title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Trip must have a destination"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after or equal to start date",
      },
    },
    travelers: {
      type: Number,
      required: [true, "Number of travelers is required"],
      min: [1, "There must be at least 1 traveler"],
    },
    budgetCategory: {
      type: String,
      enum: {
        values: ["Budget", "Mid-range", "Luxury"],
        message: "{VALUE} is not a valid budget category",
      },
      default: "Mid-range",
    },
    estimatedBudget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      default: 0,
    },
    interests: [
      {
        type: String,
        enum: [
          "Beach",
          "Mountain",
          "City",
          "Cultural",
          "Adventure",
          "Relaxation",
          "Wildlife",
          "Historical",
          "Food",
          "Nightlife",
        ],
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["draft", "planned", "ongoing", "completed", "cancelled"],
        message: "{VALUE} is not a valid trip status",
      },
      default: "draft",
    },
    itinerary: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Itinerary",
      },
    ],
    isShared: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without shareId, but unique when present
    },
  },
  { timestamps: true },
);

export default mongoose.model("Trip", tripSchema);
