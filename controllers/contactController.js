const catchAsync = require("../utils/catchAsync");
const Contact = require("../models/contactModel");
// const io = require("../server");

// -----------------
//Route handdlers
// -----------------

// Get all contacts of enquiery
// -----------------------
exports.getAllContact = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const contact = await Contact.find().sort({ $natural: -1 });
  io.emit("contact-added", contact);

  res.status(200).json({
    message: "success",
    message: "Contact fetched successfully!",
    results: contact.length,

    data: {
      contact: contact,
    },
  });
});

// Create a enquiery contact
// -----------------------
exports.createContact = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const newContact = await Contact.create(req.body);
  const contact = await Contact.find().sort({ $natural: -1 });

  io.emit("contact-added", contact);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      contact: newContact,
    },
  });
});
