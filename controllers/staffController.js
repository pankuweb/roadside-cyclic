const catchAsync = require("../utils/catchAsync");
const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Get Tasks of staff ----
// -----------------------
exports.getTasks = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const orders = await Order.find().sort({ $natural: -1 });
  //Current tasks
  const current_tasks = orders.filter(
    (item) =>
      item.task_status != "n/a" &&
      item.task_status != "order_completed" &&
      item.task_status != "order_canceled" &&
      item.task_status != "task_completed"
  );

  const CurrentTask = current_tasks.filter(
    (item) => item.staff_id == req.body.userID
  );

  // Completed tasks
  const tasks = orders.filter(
    (item) =>
      item.status == "order_completed" && item.task_status == "task_completed"
  );

  const completedTasks = tasks.filter(
    (item) => item.staff_id == req.body.userID
  );
  io.emit("current-tasks", CurrentTask);
  io.emit("completed-tasks", completedTasks);

  res.status(200).json({
    message: "success",
    message: "Current tasks fetched successfully!",
    results: {
      completedTasks: completedTasks.length,
      currentTasks: CurrentTask.length,
    },
    data: {
      CurrentTask,
      completedTasks,
    },
  });
});

// Completed tasks
// -----------------------
// exports.getCompletedTasks = catchAsync(async (req, res) => {
//   const orders = await Order.find();
//   const tasks = orders.filter((item) => item.status == "order_completed");

//   const completedTasks = tasks.filter(
//     (item) => item.customer_id.id == req.body.userID
//   );
//   res.status(200).json({
//     message: "success",
//     message: "Completed tasks fetched successfully!",
//     results: completedTasks.length,
//     data: {
//       completedTasks,
//     },
//   });
// });

// Get Recent 5 Tasks of staff ----
// -----------------------
exports.getFiveCompTasks = catchAsync(async (req, res) => {
  const io = req.app.get("io");
  const orders = await Order.find({ status: "order_completed" })
    .sort({ $natural: -1 })
    .limit(5);
  const tasks = orders.filter(
    (item) =>
      item.task_status != "n/a" &&
      item.task_status == "order_completed" &&
      item.task_status != "order_canceled"
  );
  const CurrentTask = tasks.filter(
    (item) => item.customer_id.id == req.body.userID
  );

  io.emit("last-five-tasks", CurrentTask);

  res.status(200).json({
    message: "success",
    message: "Current tasks fetched successfully!",
    results: CurrentTask.length,
    data: {
      CurrentTask,
    },
  });
});
