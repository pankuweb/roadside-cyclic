const catchAsync = require("../utils/catchAsync");
const Membership = require("../models/membershipModel");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Fleet = require("../models/fleetModel");
const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Get all memberships ----
// -----------------------
exports.getAllMembership = catchAsync(async (req, res) => {
  const membership = await Membership.find().sort({ $natural: -1 });

  res.status(200).json({
    message: "success",
    message: "Membership fetched successfully!",
    data: {
      membership: membership,
    },
  });
});

// Get membership by id ----
// -----------------------
exports.getMembership = catchAsync(async (req, res, next) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return next(new AppError("No membership found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      membership,
    },
  });
});

// Add new membership ----
// -----------------------
exports.createMembership = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const newMembership = await Membership.create(req.body);

  // Update users
  const fleet = await Fleet.find();
  const membership = await Membership.find();
  const allUsers = await User.find();
  const user = allUsers.filter((item) => item.position == "user_customer");
  const totalOrders = await Order.find();
  const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
    return acc + Number(item.total_amount ? item.total_amount : 0);
  }, 0);
  const data = {
    totalAmountsofOrders: totalAmountsofOrders,
    fleet: fleet.length,
    membership: membership.length,
    user: user.length,
  };
  io.emit("all-reports", data);
  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      membership: newMembership,
    },
  });
});

// Update membership ----
// -----------------------
exports.updateMembership = catchAsync(async (req, res, next) => {
  const membership = await Membership.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!membership) {
    return next(new AppError("No membership found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      membership,
    },
  });
});

// Delete membership ----
// -----------------------
exports.deleteMembership = catchAsync(async (req, res, next) => {
  const membership = await Membership.findByIdAndDelete(req.params.id);

  if (!membership) {
    return next(new AppError("No membership found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "membership deleted successfully!",
    },
  });
});
