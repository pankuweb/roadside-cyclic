const catchAsync = require("../utils/catchAsync");
const Order = require("../models/orderModel");
const AppError = require("../utils/appError");
const User = require("./../models/userModel");
const Notification = require("../models/notificationModel");
const Fleet = require("../models/fleetModel");
const Membership = require("../models/membershipModel");

const APIFeatures = require("./../utils/apiFeatures");
var FCM = require("fcm-node");

// -----------------
//Route handdlers
// -----------------

// Get all orders ----
// -----------------------
exports.getAllOrder = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const allOrders = await Order.find().sort({ $natural: -1 });

  const orders = allOrders.map((item) => {
    if (
      item.customer_id == null ||
      item.customer_id.purched_memberships == "" ||
      item.customer_id.purched_memberships[0].transition == ""
    ) {
      item.amount = item.amount;
    } else {
      item.amount = item
        ? item.customer_id.purched_memberships[0].transition[0].amount / 100
        : 0;
    }

    return item;
  });
  io.emit("order-list", orders);

  res.status(200).json({
    message: "success",
    message: "Orders fetched successfully!",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Get order by id ----
// -----------------------
exports.getOrder = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");
  const order = await Order.findById(req.params.id);
  if (
    order.customer_id == null ||
    order.customer_id.purched_memberships == "" ||
    order.customer_id.purched_memberships[0].transition == ""
  ) {
    order.amount = 0;
  } else {
    order.amount = order.customer_id
      ? order.customer_id.purched_memberships[0].transition[0].amount / 100
      : "";
  }

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  io.emit("single-order", order);

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      order,
    },
  });
});

// Get Recently added orders  ----
// -----------------------
exports.getRecentlyAdded = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ customer_id: req.params.id }).sort({
    $natural: -1,
  });

  // const test = order.slice(0, 9);
  res.status(200).json({
    message: "success",
    message: "Orders fetched successfully!",
    results: orders.length,

    data: {
      orders,
    },
  });
});

// Create a new order  ----
// -----------------------
exports.createOrder = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const users = await User.findById(req.body.customer_id);
  const order = await Order.find();
  const count = order.length + 1;
  req.body.invoice_no = ("000000" + count).slice(-6);

  //Getting selected vehicle
  const selectedVehicle = users.vehicle.filter(
    (item) => item._id == req.body.vehicle_id
  );
  req.body.vehicle_id = selectedVehicle;

  //Getting selected address
  const selectedAddress = users.address.filter(
    (item) => item._id == req.body.address_id
  );
  req.body.address_id = selectedAddress;

  const orders = await Order.create(req.body);

  const notification = {
    id: orders._id,
    title: `A new order created with order id ${orders._id}. Please review to confirm it`,
    description: "A new order created successfully!",
    type: "order",
  };

  await Notification.create(notification);
  const find = await Order.find().sort({ $natural: -1 });

  io.emit("order-list", find);

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

  // Update reports
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

  // staff tasksk

  const stafforders = await Order.find().sort({ $natural: -1 });
  //Current tasks
  const current_tasks = stafforders.filter(
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
  const tasks = stafforders.filter(
    (item) =>
      item.status == "order_completed" && item.task_status == "task_completed"
  );

  const completedTasks = tasks.filter(
    (item) => item.staff_id == req.body.userID
  );
  io.emit("current-tasks", CurrentTask);
  io.emit("completed-tasks", completedTasks);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Update order  ----
// -----------------------
exports.updateOrder = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }
  const find = await Order.findById(req.params.id);

  io.emit("single-order", find);
  //
  const finds = await Order.find().sort({ $natural: -1 });

  io.emit("order-list", finds);

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

  // Update reports
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

  // staff tasksk

  const stafforders = await Order.find().sort({ $natural: -1 });
  //Current tasks
  const current_tasks = stafforders.filter(
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
  const tasks = stafforders.filter(
    (item) =>
      item.status == "order_completed" && item.task_status == "task_completed"
  );

  const completedTasks = tasks.filter(
    (item) => item.staff_id == req.body.userID
  );
  io.emit("current-tasks", CurrentTask);
  io.emit("completed-tasks", completedTasks);

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      order,
    },
  });
});

// Delete order  ----
// -----------------------
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "order deleted successfully!",
    },
  });
});

// Get all orders of a customer by customer id ----
// -----------------------
exports.customersAllOrder = catchAsync(async (req, res) => {
  const allOrders = await Order.find().sort({ $natural: -1 });

  const UserOrders = allOrders.filter((item) => item._id == req.params.id);

  const orders = UserOrders.map((item) => {
    item.amount = item.customer_id
      ? item.customer_id.purched_memberships[0].transition[0].amount / 100
      : "";
    return item;
  });

  res.status(200).json({
    message: "success",
    message: "Orders fetched successfully!",
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Send Notification to client ----
// -----------------------
exports.clientNotification = catchAsync(async (req, res) => {
  var fcm = new FCM(
    "AAAAtSwpZbU:APA91bEw148bXg0vzyZlxGRBwcKFLalukdn92B9_ekPZWYXfAAdE6lWiU5uhPZ87A95AxigtUYa4-vrv7yPTlugPc_OXwxw_ahnNkfUTfJPGbKYF7xMlzreBWu50-TevJo2wj102Fex0"
  );

  // var message = {
  //   //this may vary according to the message type (single recipient, multicast, topic, et cetera)
  //   to: "topic" + req.body.topic,
  //   notification: {
  //     title: req.body.title,
  //     body: req.body,
  //   },

  //   data: req.body.data,
  // };
  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: req.body.token,
    notification: {
      title: req.body.title,
      body: req.body.body,
      type: req.body.type,
      image: req.body.image,
    },

    data: {
      //you can send only notification or only data(or include both)
      type: req.body.type,
      title: req.body.title,
      body: req.body.data,
      image: req.body.image,
      fcm_options: {
        image: req.body.image,
      },
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log(err, err.message);
    } else {
      res.status(200).json({
        message: "success",
        message: "Successfully sent with response!",
        data: {
          message: message,
        },
      });
    }
  });
});
