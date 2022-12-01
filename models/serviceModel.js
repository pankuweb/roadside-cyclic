const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: Number,
    },
    parentId: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
    },
    detail: {
      type: String,
    },
    tooltip: {
      type: String,
    },
    price: {
      type: Number,
    },
    image: {
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

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
