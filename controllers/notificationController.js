const catchAsync = require("../utils/catchAsync");
const Notification = require("../models/notificationModel");

// -----------------
//Route handdlers
// -----------------

// Add new notification ----
// -----------------------
exports.createNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      notification: notification,
    },
  });
});

// Update notification ----
// -----------------------
exports.updateNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      notification: notification,
    },
  });
});

// Update all notification ----
// -----------------------
exports.updateAllNotification = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const notification = await Notification.updateMany(
    {},
    { $set: { isViewed: true } }
  );

  const unViewedNotification = await Notification.find({
    isViewed: false,
  }).sort({
    $natural: -1,
  });
  const unClosed = await Notification.find().sort({
    $natural: -1,
  });
  io.emit("unviewed-notification-list", unViewedNotification);
  io.emit("unClosed-notification-list", unClosed);

  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      notification: notification,
    },
  });
});

// Get all unclosed notifications ----
// -----------------------
exports.getUnClosedNotifications = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const notification = await Notification.find({ isClosed: false }).sort({
    $natural: -1,
  });
  io.emit("unClosed-notification-list", notification);

  res.status(200).json({
    message: "success",
    message: "Contact fetched successfully!",
    results: notification.length,
    data: {
      notification: notification,
    },
  });
});

// Get all unviewed notifications ----
// -----------------------
exports.getUnviewedNotifications = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const notification = await Notification.find({ isViewed: false }).sort({
    $natural: -1,
  });
  io.emit("unviewed-notification-list", notification);

  res.status(200).json({
    message: "success",
    message: "Contact fetched successfully!",
    results: notification.length,
    data: {
      notification: notification,
    },
  });
});

// Remove notification ----
// -----------------------
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");
  const notification = await Notification.findByIdAndDelete(req.params.id);
  const unViewedNotification = await Notification.find({
    isViewed: false,
  }).sort({
    $natural: -1,
  });
  const unClosed = await Notification.find().sort({
    $natural: -1,
  });
  io.emit("unviewed-notification-list", unViewedNotification);
  io.emit("unClosed-notification-list", unClosed);
  if (!notification) {
    return next(new AppError("No notification found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "notification removed successfully!",
    },
  });
});
