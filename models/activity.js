import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Activity must belong to a destination"],
    },
    name: {
      type: String,
      required: [true, "Activity name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "Sightseeing",
          "Food",
          "Adventure",
          "Relaxation",
          "Shopping",
          "Nightlife",
          "Cultural",
          "Transport",
        ],
        message: "{VALUE} is not a valid activity category",
      },
      required: [true, "Category is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    estimatedCost: {
      type: Number,
      required: [true, "Estimated cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    durationMinutes: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Activity", activitySchema);
