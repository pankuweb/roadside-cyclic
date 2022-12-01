const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const CheckList = require("../models/checkListModel");
const CheckListChild = require("../models/checkListItemModel");

// Add new checkchidlist ----
// -----------------------
exports.createchecklist = catchAsync(async (req, res, next) => {
  const newchecklist = await CheckList.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      checklist: newchecklist,
    },
  });
});

// checkin staff ----
// -----------------------
exports.StaffCheckIn = catchAsync(async (req, res, next) => {
  const checklist = await CheckList.find();
  const checklistchild = await CheckListChild.find();

  const getStaffChecklist = checklist.filter((item) => {
    return item.staffId
      ? item.staffId.id
      : "" == req.params.id
      ? req.params.id
      : "";
  });

  // Combine checked data with existing start
  // const mergedList = checklistchild.map((item, i) =>
  //   Object.assign({}, item, req.body.checkIn[i])
  // );
  let mergedList = checklistchild.map((subject) => {
    let otherSubject = req.body.checkIn.find(
      (element) => element.id === subject.id
    );
    return { ...subject, ...otherSubject };
  });

  req.body.checkIn = mergedList;
  //Combine checked data with existing eend

  var newchecklist = "";
  if (getStaffChecklist.length == 0) {
    //If checklist exist of particular staff
    newchecklist = await CheckList.create(req.body);
  } else {
    //If doesnot checklist exist of particular staff
    const checklist = await CheckList.find();

    const getStaffChecklist = checklist.filter((item) => {
      return item.staffId ? item.staffId.id : "" == req.params.id;
    });
    const StaffData = getStaffChecklist[0];

    StaffData.checkIn = req.body.checkIn;
    StaffData.checkInMessage = req.body.checkInMessage;
    newchecklist = await StaffData.save();
  }

  res.status(201).json({
    status: "success",
    message: "Checked in successfully!",
    data: {
      checklist: newchecklist,
    },
  });
});

// checkout staff ----
// -----------------------
exports.StaffCheckOut = catchAsync(async (req, res, next) => {
  const checklist = await CheckList.find();
  const checklistchild = await CheckListChild.find();

  const getStaffChecklist = checklist.filter((item) => {
    return item.staffId ? item.staffId.id : "" == req.params.id;
  });

  // Combine checked data with existing start
  // const mergedList = checklistchild.map((item, i) =>
  //   Object.assign({}, item, req.body.checkOut[i])
  // );
  let mergedList = checklistchild.map((subject) => {
    let otherSubject = req.body.checkOut.find(
      (element) => element.id === subject.id
    );
    return { ...subject, ...otherSubject };
  });
  req.body.checkOut = mergedList;
  //Combine checked data with existing eend

  var newchecklist = "";
  if (getStaffChecklist.length == 0) {
    return next(new AppError("Please checkin first!", 404));
  } else {
    //
    const checklist = await CheckList.find();

    const getStaffChecklist = checklist.filter((item) => {
      return item.staffId ? item.staffId.id : "" == req.params.id;
    });
    const StaffData = getStaffChecklist[0];

    StaffData.checkOut = [];
    StaffData.checkOut = req.body.checkOut;
    StaffData.checkOutMessage = req.body.checkOutMessage;
    newchecklist = await StaffData.save();
  }

  res.status(201).json({
    status: "success",
    message: "Checked out successfully!",
    data: {
      checklist: newchecklist,
    },
  });
});

// Empty the checklist ----
// -----------------------
exports.StaffCheckListEmpty = catchAsync(async (req, res, next) => {
  const checklistchild = await CheckListChild.find();

  const checklist = await CheckList.find();

  const getStaffChecklist = checklist.filter((item) => {
    return item.staffId ? item.staffId.id : "" == req.params.id;
  });

  const StaffData = getStaffChecklist[0];

  StaffData.checkOut = checklistchild;
  StaffData.checkIn = checklistchild;
  StaffData.checkInMessage = "";
  StaffData.checkOutMessage = "";

  // console.log(StaffData);
  const checkList = await StaffData.save();

  res.status(201).json({
    status: "success",
    message: "Checked out successfully!",
    data: {
      checklist: checkList,
    },
  });
});

// Get Perticular Staff Checklist By ID ----
// -----------------------
exports.StaffCheckList = catchAsync(async (req, res, next) => {
  const checklist = await CheckList.find();

  const getStaffChecklist = checklist.filter((item) => {
    if (item.staffId) {
      return req.params.id == item.staffId.id;
    }
  });
  const StaffData = getStaffChecklist[0];

  res.status(200).json({
    status: "success",
    message: "Checked out successfully!",
    data: {
      checklist: StaffData,
    },
  });
});

// Get all checklist ----
// -----------------------
exports.getAllchecklist = catchAsync(async (req, res) => {
  const checklists = await CheckList.find();

  res.status(200).json({
    message: "success",
    message: "checklist fetched successfully!",
    results: checklists.length,
    data: {
      checklist: [...checklists],
    },
  });
});

/// Get by id -----------
exports.getchecklist = catchAsync(async (req, res) => {
  const checklist = await CheckList.findById(req.params.id);

  if (!checklist) {
    return next(new AppError("No checklist found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      checklist,
    },
  });
});

// Update checklist ----
// -----------------------
exports.updatechecklist = catchAsync(async (req, res, next) => {
  const checklist = await CheckList.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!checklist) {
    return next(new AppError("No checklist found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      checklist,
    },
  });
});

// Delete checklistc ----
// -----------------------
exports.deletechecklist = catchAsync(async (req, res, next) => {
  const checklists = await CheckList.findByIdAndDelete(req.params.id);

  if (!checklists) {
    return next(new AppError("No checklists found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "checklists deleted successfully!",
    },
  });
});

// Update checklist ----
// -----------------------
exports.checkInStaff = catchAsync(async (req, res, next) => {
  const checklist = await CheckList.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!checklist) {
    return next(new AppError("No checklist found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      checklist,
    },
  });
});
