const express = require("express");
const orderController = require("../controllers/orderController");
const staffController = require("../controllers/staffController");
const passport = require("passport");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(orderController.getAllOrder)
  .post(orderController.createOrder);

router.route("/recent-order").get(orderController.getRecentlyAdded);
router.route("/all-tasks").post(staffController.getTasks);

router.route("/last-completed-tasks").post(staffController.getFiveCompTasks);
router.route("/client-notification").post(orderController.clientNotification);

// router
//   .route("/completed-tasks")
//   .post(
//     passport.authenticate("jwt", { session: false }),
//     staffController.getCompletedTasks
//   );
router.route("/users-order/:id").get(orderController.getRecentlyAdded);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
