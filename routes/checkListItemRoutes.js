const express = require("express");
const checkListItemController = require("../controllers/checkListItemController");

const router = express.Router();

router
  .route("/")
  .post(checkListItemController.createchecklistChild)
  .get(checkListItemController.getAllchecklistChild);

router
  .route("/:id")
  .get(checkListItemController.getchecklistChild)
  .patch(checkListItemController.updatechecklistChild)
  .delete(checkListItemController.deletechecklistChild);

module.exports = router;
