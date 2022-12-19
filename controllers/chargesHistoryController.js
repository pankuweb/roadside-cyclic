const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Charges = require("../models/chargesHistoryModel");

// Add new checkchidlist ----
// -----------------------
exports.createchargesHistory = catchAsync(async (req, res, next) => {
  const newcharges = await Charges.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      charges: newcharges,
    },
  });
});

// Get all charges ----
// -----------------------
exports.getAllchargesHistory = catchAsync(async (req, res) => {
  const charges = await Charges.find({ customer_id: req.params.id }).sort({
    $natural: -1,
  });

  res.status(200).json({
    message: "success",
    message: "charges fetched successfully!",
    results: charges.length,
    data: {
      charges: charges,
    },
  });
});

// Update charges ----
// -----------------------
exports.updatechargesHistory = catchAsync(async (req, res, next) => {
  const charges = await Charges.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!charges) {
    return next(new AppError("No charges found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      charges,
    },
  });
});

// Delete charges ----
// -----------------------
exports.deletechargesHistory = catchAsync(async (req, res, next) => {
  const charges = await Charges.findByIdAndDelete(req.params.id);

  if (!charges) {
    return next(new AppError("No charges found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "charges deleted successfully!",
    },
  });
});
