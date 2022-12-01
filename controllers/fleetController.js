const catchAsync = require("../utils/catchAsync");
const Fleet = require("../models/fleetModel");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Membership = require("../models/membershipModel");
const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Get all fleets ----
// -----------------------
exports.getAllFleet = catchAsync(async (req, res) => {
  const fleet = await Fleet.find().sort({ $natural: -1 });

  res.status(200).json({
    message: "success",
    message: "Fleet fetched successfully!",

    data: {
      fleet: fleet,
    },
  });
});

// Get fleet by id ----
// -----------------------
exports.getFleet = catchAsync(async (req, res, next) => {
  const fleet = await Fleet.findById(req.params.id);

  if (!fleet) {
    return next(new AppError("No fleet found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      fleet,
    },
  });
});

// Add new fleet ----
// -----------------------
exports.createFleet = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const newFleet = await Fleet.create(req.body);

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
      fleet: newFleet,
    },
  });
});

// Update fleet ----
// -----------------------
exports.updateFleet = catchAsync(async (req, res, next) => {
  const fleet = await Fleet.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!fleet) {
    return next(new AppError("No fleet found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      fleet,
    },
  });
});

// Delete fleet ----
// -----------------------
exports.deleteFleet = catchAsync(async (req, res, next) => {
  const fleet = await Fleet.findByIdAndDelete(req.params.id);

  if (!fleet) {
    return next(new AppError("No fleet found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "fleet deleted successfully!",
    },
  });
});
