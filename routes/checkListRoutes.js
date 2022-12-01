const express = require("express");
const checkListController = require("../controllers/checkListController");

const router = express.Router();

router
  .route("/")
  .post(checkListController.createchecklist)
  .get(checkListController.getAllchecklist);

router
  .route("/:id")
  .get(checkListController.getchecklist)
  .patch(checkListController.updatechecklist)
  .delete(checkListController.deletechecklist);

router.route("/checkin/:id").post(checkListController.checkInStaff);
router.route("/check-in/:id").post(checkListController.StaffCheckIn);
router.route("/check-out/:id").patch(checkListController.StaffCheckOut);
router
  .route("/empty-checklist/:id")
  .patch(checkListController.StaffCheckListEmpty);
router.route("/staff-checklist/:id").get(checkListController.StaffCheckList);

module.exports = router;
