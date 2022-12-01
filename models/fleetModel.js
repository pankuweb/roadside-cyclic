const mongoose = require("mongoose");

const fleetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: String,
    },
    vehicle_model: {
      type: String,
    },
    year: {
      type: Number,
    },
    color: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "busy"],
      default: "active",
    },
    registration_no: {
      type: Number,
    },
    fuel_type: {
      type: String,
    },
    license_plate: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { versionKey: false }
);

const Fleet = mongoose.model("Fleet", fleetSchema);

module.exports = Fleet;
