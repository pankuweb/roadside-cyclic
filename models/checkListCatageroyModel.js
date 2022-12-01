const mongoose = require("mongoose");

const checkListParentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    Detail: {
      type: String,
    },
    status: {
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
  }
);

const checkListParent = mongoose.model(
  "checkListParent",
  checkListParentSchema
);

module.exports = checkListParent;
