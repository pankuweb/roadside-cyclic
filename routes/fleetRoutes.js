const express = require("express");
const fleetController = require("../controllers/fleetController");
const router = express.Router();
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(fleetController.getAllFleet)
  .post(fleetController.createFleet);

router
  .route("/:id")
  .get(fleetController.getFleet)
  .patch(fleetController.updateFleet)
  .delete(fleetController.deleteFleet);

module.exports = router;
