const mongoose = require("mongoose");

const checkListChildSchema = new mongoose.Schema(
  {
    parentId: {
      type: String,
    },
    parentName: {
      type: String,
    },
    name: {
      type: String,
    },
    details: {
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

const CheckListChild = mongoose.model("CheckListChild", checkListChildSchema);

module.exports = CheckListChild;
