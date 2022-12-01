const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const CheckListChild = require("../models/checkListItemModel");

// Add new checkchidlist ----
// -----------------------
exports.createchecklistChild = catchAsync(async (req, res, next) => {
  const checklistchild = await CheckListChild.find();
  req.body.serviceId = checklistchild.length + 1;

  const newchecklistchild = await CheckListChild.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      checklistchild: newchecklistchild,
    },
  });
});

// Get all checklistchild ----
// -----------------------
exports.getAllchecklistChild = catchAsync(async (req, res) => {
  const checklistchild = await CheckListChild.find().sort({ $natural: -1 });

  res.status(200).json({
    message: "success",
    message: "checklistchild fetched successfully!",
    results: checklistchild.length,
    data: {
      checklistchild: checklistchild,
    },
  });
});

/// Get by id -----------
exports.getchecklistChild = catchAsync(async (req, res) => {
  const checklistchild = await CheckListChild.findById(req.params.id);

  if (!checklistchild) {
    return next(new AppError("No checklistchild found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      checklistchild,
    },
  });
});

// Update checklistchild ----
// -----------------------
exports.updatechecklistChild = catchAsync(async (req, res, next) => {
  const checklistchild = await CheckListChild.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!checklistchild) {
    return next(new AppError("No checklistchild found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      checklistchild,
    },
  });
});

// Delete checklistchild ----
// -----------------------
exports.deletechecklistChild = catchAsync(async (req, res, next) => {
  const checklistchild = await CheckListChild.findByIdAndDelete(req.params.id);

  if (!checklistchild) {
    return next(new AppError("No checklistchild found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "checklistchild deleted successfully!",
    },
  });
});
