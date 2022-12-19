const catchAsync = require("../utils/catchAsync");
const RentVehicle = require("../models/rentVehicleModel");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const Membership = require("../models/membershipModel");
const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Get all rentVehicles ----
// -----------------------
exports.getAllRentVehicle = catchAsync(async (req, res) => {
  const rentVehicle = await RentVehicle.find({
    customer_id: req.params.id,
  }).sort({
    $natural: -1,
  });

  res.status(200).json({
    message: "success",
    message: "RentVehicle fetched successfully!",
    length: rentVehicle.length,
    data: {
      rentVehicle: rentVehicle,
    },
  });
});

// Get rentVehicle by id ----
// -----------------------
// exports.getRentVehicle = catchAsync(async (req, res, next) => {
//   const rentVehicle = await RentVehicle.findById(req.params.id);

//   if (!rentVehicle) {
//     return next(new AppError("No rentVehicle found with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     message: "fetched successfully!",
//     data: {
//       rentVehicle,
//     },
//   });
// });

// Add new rentVehicle ----
// -----------------------
exports.createRentVehicle = catchAsync(async (req, res, next) => {
  // const io = req.app.get("io");

  const newRentVehicle = await RentVehicle.create(req.body);

  // Update users
  // const rentVehicle = await RentVehicle.find();
  // const membership = await Membership.find();
  // const allUsers = await User.find();
  // const user = allUsers.filter((item) => item.position == "user_customer");
  // const totalOrders = await Order.find();
  // const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
  //   return acc + Number(item.total_amount ? item.total_amount : 0);
  // }, 0);

  // const data = {
  //   totalAmountsofOrders: totalAmountsofOrders,
  //   rentVehicle: rentVehicle.length,
  //   membership: membership.length,
  //   user: user.length,
  // };

  // io.emit("all-reports", data);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      rentVehicle: newRentVehicle,
    },
  });
});

// Update rentVehicle ----
// -----------------------
exports.updateRentVehicle = catchAsync(async (req, res, next) => {
  const rentVehicle = await RentVehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!rentVehicle) {
    return next(new AppError("No rentVehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      rentVehicle,
    },
  });
});

// Delete rentVehicle ----
// -----------------------
exports.deleteRentVehicle = catchAsync(async (req, res, next) => {
  const rentVehicle = await RentVehicle.findByIdAndDelete(req.params.id);

  if (!rentVehicle) {
    return next(new AppError("No rentVehicle found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "rentVehicle deleted successfully!",
    },
  });
});
