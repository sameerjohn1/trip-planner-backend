import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: [true, "Itinerary day must belong to a trip"],
    },
    dayNumber: {
      type: Number,
      required: [true, "Day number is required"],
      min: [1, "Day number must be at least 1"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    activities: [
      {
        activity: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Activity",
          required: true,
        },
        startTime: {
          type: String, // stored as "HH:mm" for simplicity in MVP
        },
        notes: {
          type: String,
          trim: true,
          maxlength: [300, "Notes cannot exceed 300 characters"],
        },
      },
    ],
    estimatedDayCost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true },
);

// Prevent duplicate day numbers for the same trip
itinerarySchema.index({ trip: 1, dayNumber: 1 }, { unique: true });

export default mongoose.model("Itinerary", itinerarySchema);
