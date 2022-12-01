const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    qty: {
      type: Number,
    },
    invoice_no: {
      type: String,
    },
    emergencyMessage: {
      type: String,
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User must belong to a user"],
    },
    service_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Service",
    },
    service_details: {
      type: Array,
    },
    membership_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Membership",
    },
    membership_details: {
      type: Object,
    },
    fleet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fleet",
    },
    vehicle_id: {
      type: Array,
    },
    address_id: {
      type: Array,
    },
    details: {
      type: String,
    },
    customer_status: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    total_amount: {
      type: Number,
    },
    towing: {
      type: Boolean,
      default: false,
    },
    payment_type: {
      type: String,
    },
    distance: {
      type: String,
    },
    notes: {
      type: String,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    transaction: {
      type: Array,
    },
    cancel_reason: {
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
    status: {
      type: String,
      enum: [
        "order_initiated",
        "order_placed",
        "order_in_progress",
        "order_completed",
        "order_canceled",
      ],
      default: "order_initiated",
    },
    task_status: {
      type: String,
      enum: [
        "n/a",
        "staff_assigned",
        "reached_at_location",
        "setting_safety_items",
        "access_situation",
        "rectifiying_problem",
        "towing_required",
        "task_completed",
      ],
      default: "n/a",
    },
    staff_status: {
      type: String,
      enum: ["n/a", "staff_assigned"],
      default: "n/a",
    },
    fleet_status: {
      type: String,
      enum: ["n/a", "fleet_assigned"],
      default: "n/a",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { versionKey: false }
);

// orderSchema.index(
//   { user: 1, service: 1, vehicle: 1, address: 1 },
//   { unique: true }
// );

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer_id",
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
    path: "service_id",
    select: ["name", "detail", "price"],
  });
  this.populate({
    path: "fleet_id",
    select: ["name", "status", "fuel_type"],
  });
  this.populate({
    path: "membership_id",
    select: ["name", "service_id", "price"],
  });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
