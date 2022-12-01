const express = require("express");
const membershipController = require("../controllers/membershipController");
const router = express.Router();
const authController = require("./../controllers/authController");

router
  .route("/")
  .get(membershipController.getAllMembership)
  .post(membershipController.createMembership);

router
  .route("/:id")
  .get(membershipController.getMembership)
  .patch(membershipController.updateMembership)
  .delete(membershipController.deleteMembership);

module.exports = router;
