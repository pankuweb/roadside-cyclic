const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
var format = require("date-format");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    userName: {
      type: String,
    },
    customer_device_token: {
      type: String,
    },
    staff_device_token: {
      type: String,
    },
    email: {
      type: String,
      unique: [true],
      required: true,
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "busy"],
      default: "active",
    },
    position: {
      type: String,
      enum: ["user_admin", "user_staff", "user_customer"],
    },
    city: {
      type: String,
    },
    mobile_number: {
      type: String,
    },
    alternative_phone: {
      type: String,
    },
    home: {
      type: String,
    },
    cell: {
      type: String,
    },
    lat: {
      type: String,
    },
    long: {
      type: String,
    },
    customer_status: {
      type: Number,
    },
    customerNotes: {
      type: String,
    },
    gender: {
      type: String,
    },
    image: {
      type: String,
    },
    lic_no: {
      type: String,
    },
    user_code: {
      type: Number,
    },
    otp: {
      type: String,
    },
    designation: {
      type: String,
    },
    experience: {
      type: String,
    },
    employee_id: {
      type: String,
    },
    description: {
      type: String,
    },
    joi_date: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
    },
    expiryotp: {
      type: Date,
    },
    user_id: {
      type: String,
    },
    address: [
      {
        lat: {
          type: Number,
        },
        long: {
          type: Number,
        },
        street_no: {
          type: String,
        },
        address: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        zip: {
          type: Number,
        },
        type: {
          type: String,
        },
      },
    ],
    vehicle: [
      {
        type: {
          type: String,
        },
        name: {
          type: String,
        },
        year: {
          type: String,
        },
        model: {
          type: String,
        },
        color: {
          type: String,
        },
        reg_no: {
          type: String,
        },
        vehicle: {
          type: String,
        },
      },
    ],
    purched_memberships: [
      {
        id: { type: String },
        allowedOrders: {
          type: Number,
        },
        membership_id: {
          type: String,
        },
        name: {
          type: String,
        },
        placedOrders: {
          type: Number,
          default: 0,
        },
        expired: {
          type: String,
          default: "false",
        },
        purchasedAt: {
          type: Date,
          default: format.asString(
            format.ISO8601_WITH_TZ_OFFSET_FORMAT,
            new Date()
          ),
        },
        expiredAt: {
          type: Date,
          default: format.asString(
            format.ISO8601_WITH_TZ_OFFSET_FORMAT,
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          ),
        },
        transition: {
          type: Array,
        },
      },
    ],
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

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
