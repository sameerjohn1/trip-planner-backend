import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Destination name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    region: {
      type: String,
      enum: {
        values: [
          "Asia",
          "Europe",
          "North America",
          "South America",
          "Africa",
          "Oceania",
          "Middle East",
        ],
        message: "{VALUE} is not a supported region",
      },
      required: [true, "Region is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    averageDailyCost: {
      type: Number,
      required: [true, "Average daily cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    bestSeason: {
      type: String,
      enum: {
        values: ["Spring", "Summer", "Autumn", "Winter", "Year-round"],
        message: "{VALUE} is not a valid season",
      },
      default: "Year-round",
    },
    tags: [
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
        ],
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Destination", destinationSchema);
