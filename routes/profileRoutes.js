const express = require("express");
const profileController = require("../controllers/profileController");
const router = express.Router();
const authController = require("../controllers/authController");

router
  .route("/")
  .post(
    profileController.uploadUserPhoto,
    profileController.resizeUserPhoto,
    profileController.createImage
  );

module.exports = router;
