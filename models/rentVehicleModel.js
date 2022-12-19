const mongoose = require("mongoose");

const rentVehicleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    customer_data: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User must belong to a user"],
    },
    vehicle_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle must belong to a user"],
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

rentVehicleSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer_data",
    select: [
      "firstName",
      "customer_device_token",
      "staff_device_token",
      "lastName",
      "purched_memberships",
      "email",
      "status",
      "phone",
      "customer_status",
      "createdAt",
    ],
  });
  this.populate({
    path: "vehicle_id",
    select: ["name", "image", "price", "fuel_type"],
  });
  next();
});

const RentVehicle = mongoose.model("RentVehicle", rentVehicleSchema);

module.exports = RentVehicle;
