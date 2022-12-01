const express = require("express");
const notificationController = require("../controllers/notificationController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(notificationController.createNotification)
  .patch(notificationController.updateNotification);

router.route("/:id").delete(notificationController.deleteNotification);

router
  .route("/unviewed-notifications")
  .get(notificationController.getUnviewedNotifications);

router
  .route("/unclosed-notifications")
  .get(notificationController.getUnClosedNotifications);

router
  .route("/isViewedTrue")
  .patch(notificationController.updateAllNotification);

module.exports = router;
