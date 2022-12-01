const express = require("express");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.route("/").get(reportController.getAllReport);

module.exports = router;
