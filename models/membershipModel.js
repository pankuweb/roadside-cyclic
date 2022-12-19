const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    // service_id: {
    //   type: [
    //     {
    //       type: mongoose.Schema.ObjectId,
    //       ref: "Service",
    //       required: [true, "Service must belong to a services"],
    //     },
    //   ],
    // },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
    },
    additionalDrivers: {
      type: Number,
    },
    vehicleLimit: {
      type: Number,
    },
    order_Counts: {
      type: Number,
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

// membershipSchema.index({ service: 1 }, { unique: true });

// membershipSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "service_id",
//     select: ["name", "detail", "price"],
//   });
//   next();
// });
const Membership = mongoose.model("Membership", membershipSchema);

module.exports = Membership;
