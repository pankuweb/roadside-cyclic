const catchAsync = require("../utils/catchAsync");
const Fleet = require("../models/fleetModel");
const Membership = require("../models/membershipModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");

// -----------------
//Route handdlers
// -----------------

// Total of fleet, membership, allUsers
// -----------------------
exports.getAllReport = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");
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
  //
  res.status(200).json({
    message: "success",
    message: "Reports fetched successfully!",
    data: {
      totalAmountsofOrders: totalAmountsofOrders,
      fleet: fleet.length,
      membership: membership.length,
      user: user.length,
    },
  });
});
