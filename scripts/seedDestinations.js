import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import Destination from "../models/destination.js";
import trips from "../data/trips.js";

dotenv.config();

const regionByCountry = {
  Canada: "North America",
  France: "Europe",
  Germany: "Europe",
  Greece: "Europe",
  Iceland: "Europe",
  Indonesia: "Asia",
  Italy: "Europe",
  Japan: "Asia",
  Morocco: "Africa",
  "New Zealand": "Oceania",
  Singapore: "Asia",
  "South Korea": "Asia",
  Spain: "Europe",
  Switzerland: "Europe",
  Thailand: "Asia",
  Turkey: "Europe",
  UAE: "Middle East",
  USA: "North America",
};

const categoryToTag = {
  Beach: "Beach",
  City: "City",
  Culture: "Cultural",
  Adventure: "Adventure",
  Nature: "Nature",
  Luxury: "Luxury",
  Romantic: "Romantic",
};

const toNumber = (value) => Number(String(value).replace(/[^0-9.]/g, ""));

const toDays = (duration) => Number.parseInt(duration, 10);

const destinationDocuments = trips.map((trip) => ({
  tripId: trip.id,
  title: trip.title,
  location: trip.location,
  duration: trip.duration,
  price: toNumber(trip.price),
  rating: trip.rating,
  category: trip.category,
  image: trip.image,
  name: trip.location,
  country:
    trip.country === "Europe" || trip.country === "Asia"
      ? trip.location
      : trip.country,
  region:
    regionByCountry[trip.country] ||
    (trip.country === "Europe" ? "Europe" : "Asia"),
  description: trip.description,
  imageUrl: trip.image,
  averageDailyCost: Math.round(toNumber(trip.price) / toDays(trip.duration)),
  bestSeason: "Year-round",
  tags: [categoryToTag[trip.category]],
}));

try {
  await connectDB();

  const operations = destinationDocuments.map((destination) => ({
    updateOne: {
      filter: { tripId: destination.tripId },
      update: { $set: destination },
      upsert: true,
    },
  }));

  const result = await Destination.bulkWrite(operations);
  console.log(
    `Seed complete: ${result.upsertedCount} inserted, ${result.modifiedCount} updated.`,
  );
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  process.exit();
}
