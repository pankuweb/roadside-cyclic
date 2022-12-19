const express = require("express");
const chargesHistoryController = require("../controllers/chargesHistoryController");
const router = express.Router();

router.route("/").post(chargesHistoryController.createchargesHistory);

router
  .route("/:id")
  .patch(chargesHistoryController.updatechargesHistory)
  .get(chargesHistoryController.getAllchargesHistory)
  .delete(chargesHistoryController.deletechargesHistory);

module.exports = router;
