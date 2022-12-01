const mongoose = require("mongoose");

const checkListSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User must belong to a user"],
    },
    checkIn: [
      {
        id: {
          type: String,
        },
        parentId: {
          type: String,
        },
        parentName: {
          type: String,
        },
        name: {
          type: String,
        },
        isChecked: {
          type: Boolean,
          default: false,
        },
        itemMessage: {
          type: String,
        },
      },
    ],
    checkInMessage: {
      type: String,
    },
    checkOut: [
      {
        id: {
          type: String,
        },
        parentId: {
          type: String,
        },
        parentName: {
          type: String,
        },
        name: {
          type: String,
        },
        isChecked: {
          type: Boolean,
          default: false,
        },
        itemMessage: {
          type: String,
        },
      },
    ],
    checkOutMessage: {
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

checkListSchema.pre(/^find/, function (next) {
  this.populate({
    path: "staffId",
    select: [
      "firstName",
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
  next();
});

const CheckList = mongoose.model("CheckList", checkListSchema);

module.exports = CheckList;
