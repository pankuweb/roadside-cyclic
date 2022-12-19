const express = require("express");
const vehicleController = require("../controllers/vehicleController");
const router = express.Router();
const authController = require("../controllers/authController");

router
  .route("/")
  .get(vehicleController.getAllVehicle)
  .post(vehicleController.createVehicle);

router
  .route("/:id")
  .get(vehicleController.getVehicle)
  .patch(vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle);

module.exports = router;
