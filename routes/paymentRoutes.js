const express = require("express");
const paymentController = require("./../controllers/paymentController");
const authController = require("./../controllers/authController");

const router = express.Router();

// router.use(authController.protect);

// router.get("/checkout-session", paymentController.getCheckoutSession);
router.post("/create-customer", paymentController.createCustomer);
router.post("/create-card", paymentController.createCard);
router.post("/create-charges", paymentController.createCharges);

module.exports = router;
