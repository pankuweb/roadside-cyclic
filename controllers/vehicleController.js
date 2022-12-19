const catchAsync = require("../utils/catchAsync");
const Vehicle = require("../models/vehicleModel");
const AppError = require("../utils/appError");
// const User = require("../models/userModel");
// const Membership = require("../models/membershipModel");
// const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Get all vehicles ----
// -----------------------
exports.getAllVehicle = catchAsync(async (req, res) => {
  const vehicle = await Vehicle.find().sort({ $natural: -1 });

  res.status(200).json({
    message: "success",
    message: "Vehicle fetched successfully!",

    data: {
      vehicle: vehicle,
    },
  });
});

// Get vehicle by id ----
// -----------------------
exports.getVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      vehicle,
    },
  });
});

// Add new vehicle ----
// -----------------------
exports.createVehicle = catchAsync(async (req, res, next) => {
  // const io = req.app.get("io");

  const newVehicle = await Vehicle.create(req.body);

  // // Update users
  // const vehicle = await Vehicle.find();
  // const membership = await Membership.find();
  // const allUsers = await User.find();
  // const user = allUsers.filter((item) => item.position == "user_customer");
  // const totalOrders = await Order.find();
  // const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
  //   return acc + Number(item.total_amount ? item.total_amount : 0);
  // }, 0);

  // const data = {
  //   totalAmountsofOrders: totalAmountsofOrders,
  //   vehicle: vehicle.length,
  //   membership: membership.length,
  //   user: user.length,
  // };

  // io.emit("all-reports", data);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      vehicle: newVehicle,
    },
  });
});

// Update vehicle ----
// -----------------------
exports.updateVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      vehicle,
    },
  });
});

// Delete vehicle ----
// -----------------------
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    return next(new AppError("No vehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "vehicle deleted successfully!",
    },
  });
});
