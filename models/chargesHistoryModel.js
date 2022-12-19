const mongoose = require("mongoose");

const chargesHistorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    customer_data: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User must belong to a user"],
    },
    customer_id: {
      type: String,
    },
    transition: {
      type: Array,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { versionKey: false }
);
chargesHistorySchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer_data",
    select: [
      "firstName",
      "customer_device_token",
      "staff_device_token",
      "lastName",
      "email",
      "status",
      "phone",
      "customer_status",
      "createdAt",
    ],
  });
  next();
});
const ChargesHistory = mongoose.model("ChargesHistory", chargesHistorySchema);

module.exports = ChargesHistory;
