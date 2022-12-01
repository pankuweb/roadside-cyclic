const Service = require("./../models/serviceModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// -----------------
//Route handdlers
// -----------------

// Get all services ----
// -----------------------
exports.getAllServices = catchAsync(async (req, res) => {
  const services = await Service.find().sort({ $natural: -1 });
  const test = JSON.parse(JSON.stringify(services));

  const kid = (p, c) => {
    if (p.hasOwnProperty("child")) {
      p.child.push(c);
    } else {
      p.child = [c];
    }
  };

  for (let i = 0; i < test.length - 1; i++) {
    const a = test[i];
    for (let j = i + 1; j < test.length; j++) {
      const b = test[j];
      if (a.serviceId === b.parentId) {
        kid(a, b);
      } else if (b.serviceId === a.parentId) {
        kid(b, a);
      }
    }
  }

  const result = test.filter((x) => !x.parentId);

  res.status(200).json({
    message: "success",
    message: "Services fetched successfully!",
    results: result.length,
    data: {
      allServices: services,
      shortedServices: result,
    },
  });
});

// Get service by id ----
// -----------------------
exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError("No service found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      service,
    },
  });
});

// Add new service ----
// -----------------------
exports.createService = catchAsync(async (req, res, next) => {
  const services = await Service.find();
  req.body.serviceId = services.length + 1;

  const newService = await Service.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      service: newService,
    },
  });
});

// Update service ----
// -----------------------
exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!service) {
    return next(new AppError("No service found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      service,
    },
  });
});

// Delete service ----
// -----------------------
exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    return next(new AppError("No service found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "service deleted successfully!",
    },
  });
});
