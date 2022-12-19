const express = require("express");
const rentVehicleController = require("../controllers/rentVehicleController");
const router = express.Router();
const authController = require("../controllers/authController");

router.route("/").post(rentVehicleController.createRentVehicle);

router
  .route("/:id")
  // .get(rentVehicleController.getRentVehicle)
  .get(rentVehicleController.getAllRentVehicle)
  .patch(rentVehicleController.updateRentVehicle)
  .delete(rentVehicleController.deleteRentVehicle);

module.exports = router;
