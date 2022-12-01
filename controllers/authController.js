const crypto = require("crypto");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");
var api = require("./../node_modules/clicksend/api.js");
const { use } = require("passport");
const { match } = require("assert");
const {
  registerValidation,
  loginValidation,
} = require("./../utils/validations/userValidation");
const Notification = require("../models/notificationModel");
const Fleet = require("../models/fleetModel");
const Membership = require("../models/membershipModel");
const Order = require("../models/orderModel");

const client = new OAuth2Client(
  "1054152746452-9ahn2j0poepq7u0fsi631ko7c0mc7c0t.apps.googleusercontent.com"
);

const signToken = (id) => {
  //
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// -----------------
//Route handdlers
// -----------------

// Create token ----
// -----------------------
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Sign up using custom details ----
// -----------------------
exports.signup = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const body = req.body;
  //Validate Data
  // const { error } = registerValidation(body);
  // if (error)
  //   return res.status(400).json({ error: true, msg: error.details[0].message });

  User.findOne(
    { email: new RegExp("^" + req.body.email + "$", "i") },
    async function (err, doc) {
      //Check if user exist then login
      if (doc) {
        res.status(404).json({
          status: "error",
          message: `Account already exist please login!`,
        });
      } else {
        const newUser = await User.create({
          firstName: req.body.firstName,
          middleName: req.body.middleName,
          lastName: req.body.lastName,
          position: req.body.position,
          email: req.body.email,
          phone: req.body.phone,
          password: req.body.password,
          user_id: req.body.password,

          // passwordConfirm: req.body.passwordConfirm ,
        });

        const token = signToken(newUser._id);
        const user = await User.find().sort({ $natural: -1 });
        io.emit("user-list", user);

        // Create notification
        if (newUser.position == "user_customer") {
          const notification = {
            id: newUser.id,
            title: `A new customer created with customer id ${newUser.id}. Please review to confirm it`,
            description: "A new customer created successfully!",
            type: "customer",
          };

          await Notification.create(notification);
          const unViewedNotification = await Notification.find({
            isViewed: false,
          }).sort({
            $natural: -1,
          });
          const unClosed = await Notification.find().sort({
            $natural: -1,
          });

          io.emit("unviewed-notification-list", unViewedNotification);
          io.emit("unClosed-notification-list", unClosed);

          // Update users
          const fleet = await Fleet.find();
          const membership = await Membership.find();
          const allUsers = await User.find();
          const user = allUsers.filter(
            (item) => item.position == "user_customer"
          );

          const totalOrders = await Order.find();
          const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
            return acc + Number(item.total_amount ? item.total_amount : 0);
          }, 0);

          const data = {
            totalAmountsofOrders: totalAmountsofOrders,
            fleet: fleet.length,
            membership: membership.length,
            user: user.length,
          };

          io.emit("all-reports", data);
        } else if (newUser.position == "user_staff") {
          const notification = {
            id: newUser.id,
            title: `A new staff created with staff id ${newUser.id}. Please review to confirm it`,
            description: "A new staff created successfully!",
            type: "staff",
          };

          await Notification.create(notification);
          const unViewedNotification = await Notification.find({
            isViewed: false,
          }).sort({
            $natural: -1,
          });
          const unClosed = await Notification.find().sort({
            $natural: -1,
          });

          io.emit("unviewed-notification-list", unViewedNotification);
          io.emit("unClosed-notification-list", unClosed);

          // Update users
          const fleet = await Fleet.find();
          const membership = await Membership.find();
          const allUsers = await User.find();
          const user = allUsers.filter(
            (item) => item.position == "user_customer"
          );
          const totalOrders = await Order.find();
          const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
            return acc + Number(item.total_amount ? item.total_amount : 0);
          }, 0);

          const data = {
            totalAmountsofOrders: totalAmountsofOrders,
            fleet: fleet.length,
            membership: membership.length,
            user: user.length,
          };

          io.emit("all-reports", data);
        }
        res.status(201).json({
          status: "success",
          message: `${
            req.body.position == "user_admin"
              ? "Admin"
              : req.body.position == "user_customer"
              ? "Customer"
              : "Staff"
          } account created successfully`,
          token,
          data: {
            user: newUser,
          },
        });
      }
    }
  );
});

// Login using email and password ----
// -----------------------
exports.login = catchAsync(async (req, res, next) => {
  const body = req.body;
  //Validate Data
  const { error } = loginValidation(body);
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const { email, password } = req.body;

  //If email and pass exist
  if (!email || !password) {
    return next(new AppError("Please provide us email and password!", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // if everything is ok then send token to client
  const token = signToken(user._id);

  res.status(200).json({
    id: user._id,
    status: "success",
    token,
    message: `${req.body.position} login successfully`,
  });
});

// Logout ----
// -----------------------
exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and checking if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this user is no longer exist.", 401)
    );
  }

  //4) if user changed password after token isuued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }

  //Grant access to route
  req.user = currentUser;
  next();
});

// Protection ----
// -----------------------
// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Forget Password ----
// -----------------------
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// Login with Google ----
// -----------------------
exports.googlelogin = catchAsync(async (req, res, next) => {
  const { tokenId, position } = req.body;

  const x = await client.verifyIdToken({
    idToken: tokenId,
    audience:
      "1054152746452-9ahn2j0poepq7u0fsi631ko7c0mc7c0t.apps.googleusercontent.com",
  });
  const email = x.payload.email;
  const data = x.payload;

  User.findOne(
    { email: new RegExp("^" + email + "$", "i") },
    function (err, doc) {
      //Check if user exist then login
      if (doc) {
        const token = signToken(doc._id);

        res.status(200).json({
          id: doc._id,
          status: "success",
          token,
          message: `${doc.position} login successfully`,
        });
      } else {
        //Check if user does not exist then signup

        res.status(400).json({
          status: "error",
          message: `Please create your account first!`,
        });
      }
    }
  );
});

// Sign up with Google ----
// -----------------------
exports.googlesignup = catchAsync(async (req, res, next) => {
  const { tokenId, position } = req.body;

  const x = await client.verifyIdToken({
    idToken: tokenId,
    audience:
      "1054152746452-9ahn2j0poepq7u0fsi631ko7c0mc7c0t.apps.googleusercontent.com",
  });
  const email = x.payload.email;
  const data = x.payload;
  // User.find({}).exec(function (err, leads) {
  //   res.send(leads);
  // });
  User.findOne(
    { email: new RegExp("^" + email + "$", "i") },
    catchAsync(async function (err, doc) {
      //Check if user exist then login
      if (doc) {
        res.status(404).json({
          status: "error",
          message: `Account already exist please login!`,
        });
      } else {
        //Check if user does not exist then signup
        const io = req.app.get("io");

        const newUser = User.create({
          firstName: data.name.split(" ")[0],
          lastName: data.name.split(" ")[1],
          position: position,
          email: data.email,
        });
        const token = signToken(newUser.email);
        //

        newUser.then((value) => {
          const Notification = require("../models/notificationModel");
          Notification.create({
            id: value.id,
            title: `A new customer created. Please review to confirm it`,
            description: "A new customer created successfully!",
            type: "customer",
          });
          Notification.find({ isViewed: false }).exec(function (err, leads) {
            // const notif = leads.filter(
            //   (item) => item.position == "user_customer"
            // );
            io.emit("unviewed-notification-list", leads);
          });
          Notification.find({}).exec(function (err, leads) {
            io.emit("unClosed-notification-list", leads);
          });
          // expected output: 123
        });
        User.find({}).exec(function (err, leads) {
          io.emit("user-list", leads);
          console.log(leads, "inleads");
        });
        Notification.find({ isViewed: false }).exec(function (err, leads) {
          // const notif = leads.filter(
          //   (item) => item.position == "user_customer"
          // );
          io.emit("unviewed-notification-list", leads);
        });
        Notification.find({}).exec(function (err, leads) {
          io.emit("unClosed-notification-list", leads);
        });
        // const notification = {
        //   id: newUser.id,
        //   title: `A new customer created with customer id ${newUser.id}. Please review to confirm it`,
        //   description: "A new customer created successfully!",
        //   type: "customer",
        // };

        // Create notification
        // if (newUser.position == "user_customer") {

        //   // Update users
        //   const fleet = await Fleet.find();
        //   const membership = await Membership.find();
        //   const allUsers = await User.find();
        //   const user = allUsers.filter(
        //     (item) => item.position == "user_customer"
        //   );
        //   const totalOrders = await Order.find();
        //   const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
        //     return acc + Number(item.total_amount ? item.total_amount : 0);
        //   }, 0);
        //   const data = {
        //     totalAmountsofOrders: totalAmountsofOrders,
        //     fleet: fleet.length,
        //     membership: membership.length,
        //     user: user.length,
        //   };
        //   io.emit("all-reports", data);
        // } else if (newUser.position == "user_staff") {
        //   const notification = {
        //     id: newUser.id,
        //     title: `A new staff created with staff id ${newUser.id}. Please review to confirm it`,
        //     description: "A new staff created successfully!",
        //     type: "staff",
        //   };

        //   await Notification.create(notification);
        //   const unViewedNotification = await Notification.find({
        //     isViewed: false,
        //   }).sort({
        //     $natural: -1,
        //   });
        //   const unClosed = await Notification.find().sort({
        //     $natural: -1,
        //   });

        //   io.emit("unviewed-notification-list", unViewedNotification);
        //   io.emit("unClosed-notification-list", unClosed);

        //   // Update users
        //   const fleet = await Fleet.find();
        //   const membership = await Membership.find();
        //   const allUsers = await User.find();
        //   const user = allUsers.filter(
        //     (item) => item.position == "user_customer"
        //   );
        //   const totalOrders = await Order.find();
        //   const totalAmountsofOrders = totalOrders.reduce((acc, item) => {
        //     return acc + Number(item.total_amount ? item.total_amount : 0);
        //   }, 0);
        //   const data = {
        //     totalAmountsofOrders: totalAmountsofOrders,
        //     fleet: fleet.length,
        //     membership: membership.length,
        //     user: user.length,
        //   };
        //   io.emit("all-reports", data);
        // }
        //
        res.status(201).json({
          status: "success",
          message: `${position} account created successfully`,
          token,
          data: {
            user: {
              firstName: data.name.split(" ")[0],
              lastName: data.name.split(" ")[1],
              position: position,
              email: data.email,
            },
          },
        });
      }
    })
  );
});

//Mobile number verification
// exports.sendOTP = catchAsync(async (req, res, next) => {
//   var smsMessage = new api.SmsMessage();

//   smsMessage.from = 9079380612;
//   smsMessage.to = req.body.phone;
//   smsMessage.body = req.body.otp;

//   var smsApi = new api.SMSApi(
//     "dcarr@pclimports.com",
//     "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
//   );

//   var smsCollection = new api.SmsMessageCollection();

//   smsCollection.messages = [smsMessage];

//   smsApi
//     .smsSendPost(smsCollection)
//     .then(function (response) {
//       res.status(200).json({
//         status: response.response_code,
//         message: `sms sent successfully`,
//       });
//     })
//     .catch(function (err) {
//       console.error(err.body);
//     });
// });

// Mobile verification while signup ----
// Send OTP ----
// -----------------------
exports.validateUserSignUp = async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiryotp = new Date(Date.now() + 20 * 3000);
  let user = await User.findById(req.body.userId);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User does not exist",
    });
  } else if (user.position != "user_customer") {
    return res.status(400).json({
      status: "error",
      message: "User should be a valid customer!",
    });
  }
  let PhoneVal = await User.find({ phone: req.body.phone });

  if (PhoneVal == "") {
    user.phone = req.body.phone;
    if (
      user.phone.toString().length > 10 &&
      user.phone.toString().length <= 12
    ) {
      user.otp = req.body.otp;
      user.expiryotp = req.body.expiryotp;

      //Send OTP on Mobile
      var smsMessage = new api.SmsMessage();

      smsMessage.from = 9079380612;
      smsMessage.to = req.body.phone;
      smsMessage.body = otp;

      var smsApi = new api.SMSApi(
        "dcarr@pclimports.com",
        "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
      );

      var smsCollection = new api.SmsMessageCollection();

      smsCollection.messages = [smsMessage];

      smsApi
        .smsSendPost(smsCollection)
        .then(function (response) {})
        .catch(function (err) {
          console.error(err.body);
        });

      //Other process
      await User.findByIdAndUpdate(req.body.userId, user, {
        new: true,
        runValidators: true,
      });
      // res.setHeader('Content-Type', 'text/plain')

      if (user) {
        await User.updateMany({ otp, expiryotp });

        return res.status(200).json({
          id: user._id,
          otp,
          status: "success",
          message: "sms sent successfully!",
        });
      }
    } else if (user.phone.toString().length == 0) {
      res.status(400).json({
        status: "error",
        message: `Please enter phone number!`,
      });
    }
    {
      res.status(400).json({
        status: "error",
        message: `Please enter valid phone number!`,
      });
    }
  } else {
    return res.status(400).json({
      status: "error",
      message: "Phone number already used please try with new one!",
    });
  }
};

// Mobile verification while signup ----
// Resend OTP ----
// -----------------------
exports.resendOTP = async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiryotp = new Date(Date.now() + 20 * 3000);
  let user = await User.find({ phone: req.body.phone });

  // if (
  //   req.body.phone.toString().length > 10 &&
  //   req.body.phone.toString().length !== 12
  // ) {
  //   return res.status(404).json({
  //     status: "error",
  //     message: "Please enter correct mobile number!",
  //   });
  // } else
  if (user[0] == "" || user[0] == undefined) {
    return res.status(404).json({
      status: "error",
      message: "User not found!",
    });
  }
  // else if (user[0].position != "user_customer") {
  //   return res.status(404).json({
  //     status: "error",
  //     message: "User should be a valid user!",
  //   });
  // }
  else if (req.body.phone.toString().length == 0) {
    res.status(400).json({
      status: "error",
      message: `Please enter phone number!`,
    });
  } else {
    // send OTP on Mobile
    var smsMessage = new api.SmsMessage();

    smsMessage.from = 9079380612;
    smsMessage.to = req.body.phone;
    smsMessage.body = otp;

    var smsApi = new api.SMSApi(
      "dcarr@pclimports.com",
      "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
    );

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi
      .smsSendPost(smsCollection)
      .then(function (response) {})
      .catch(function (err) {
        console.error(err.body);
      });

    // update data
    await User.updateMany({ otp, expiryotp });

    return res.status(200).json({
      id: user._id,
      otp,
      status: "success",
      message: "OTP sent successfully!",
    });
  }
};

// Mobile verification while signup ----
// Verify OTP ----
// -----------------------
exports.otpvalidation = async (req, res) => {
  const crunenttime = Date.now();

  const matchotp = await User.findOne({ phone: req.body.phone });

  const token = signToken(matchotp._id);

  if (!matchotp) {
    return res.status(400).json({
      status: "false",
      message: "OTP does not match!",
    });
  }
  if (matchotp.expiryotp < crunenttime) {
    return res.status(401).json({
      status: "false",
      message: "OTP Expired!",
    });
  }
  if (matchotp.otp === req.body.otp) {
    return res.status(200).json({
      token: token,
      position: matchotp.position,
      status: "success",
      message: "OTP verified successfully!",
    });
  } else {
    return res.status(400).json({
      status: "error",
      message: "Please try again",
    });
  }
};

// Login with Mobile ----
// Send OTP ----
// -----------------------
exports.sendLogninOTP = async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiryotp = new Date(Date.now() + 20 * 3000);
  let user = await User.find({ phone: req.body.phone });

  // if (
  //   req.body.phone.toString().length > 10 &&
  //   req.body.phone.toString().length !== 12
  // ) {
  //   return res.status(404).json({
  //     status: "error",
  //     message: "Please enter correct mobile number!",
  //   });
  // } else
  if (user == "") {
    return res.status(404).json({
      status: "error",
      message: "User not found!",
    });
  } else if (user[0].position != "user_staff") {
    return res.status(404).json({
      status: "error",
      message: "User should be a valid staff!",
    });
  } else if (req.body.phone.toString().length == 0) {
    res.status(400).json({
      status: "error",
      message: `Please enter phone number!`,
    });
  } else {
    // send OTP on Mobile
    var smsMessage = new api.SmsMessage();

    smsMessage.from = 9079380612;
    smsMessage.to = req.body.phone;
    smsMessage.body = otp;

    var smsApi = new api.SMSApi(
      "dcarr@pclimports.com",
      "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
    );

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi
      .smsSendPost(smsCollection)
      .then(function (response) {})
      .catch(function (err) {
        console.error(err.body);
      });

    // update data
    await User.updateMany({ otp, expiryotp });

    return res.status(200).json({
      id: user._id,
      otp,
      status: "success",
      message: "OTP sent successfully!",
    });
  }
  // if (user.phone.toString().length > 10 && user.phone.toString().length == 12) {
  //   user.otp = req.body.otp;
  //   user.expiryotp = req.body.expiryotp;

  //   //Send OTP on Mobile
  //   var smsMessage = new api.SmsMessage();

  //   smsMessage.from = 9079380612;
  //   smsMessage.to = req.body.phone;
  //   smsMessage.body = otp;

  //   var smsApi = new api.SMSApi(
  //     "dcarr@pclimports.com",
  //     "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
  //   );

  //   var smsCollection = new api.SmsMessageCollection();

  //   smsCollection.messages = [smsMessage];

  //   smsApi
  //     .smsSendPost(smsCollection)
  //     .then(function (response) {})
  //     .catch(function (err) {
  //       console.error(err.body);
  //     });

  //   //Other process
  //   // await User.findByIdAndUpdate(req.body.phone, user, {
  //   //   new: true,
  //   //   runValidators: true,
  //   // });

  //   // res.setHeader('Content-Type', 'text/plain')
  //   if (!user) {
  //     return res.status(201).json({
  //       status: "ERROR",
  //       message: "User not found!",
  //     });
  //   }

  //   if (user) {
  //     await User.updateMany({ otp, expiryotp });

  //     return res.status(200).json({
  //       id: user._id,
  //       otp,
  //       status: "success",
  //       message: "sms sent successfully!",
  //     });
  //   }
  // } else if (user.phone.toString().length == 0) {
  //   res.status(400).json({
  //     status: "error",
  //     message: `Please enter phone number!`,
  //   });
  // }
  // {
  //   res.status(400).json({
  //     status: "error",
  //     message: `Please enter valid phone number!`,
  //   });
  // }
};

// Login with Mobile ----
// Verify OTP ----
// -----------------------
exports.verifyLoginOTP = async (req, res) => {
  const crunenttime = Date.now();

  const matchotp = await User.findOne({ phone: req.body.phone });
  const token = signToken(matchotp._id);

  if (!matchotp) {
    return res.status(400).json({
      status: "error",
      message: "OTP does not match!",
    });
  }
  if (matchotp.expiryotp < crunenttime) {
    return res.status(401).json({
      status: "error",
      message: "OTP Expired!",
    });
  }
  if (matchotp.otp === req.body.otp) {
    return res.status(200).json({
      token: token,
      position: matchotp.position,
      staff: matchotp,
      status: "success",
      message: "Logged in successfully!",
    });
  } else {
    return res.status(400).json({
      status: "error",
      message: "Please try again",
    });
  }
};

// -----------------
//Process of forget password
// -----------------

// Forget Password ----
// Send OTP ----
// -----------------------
exports.sendForgotOTP = async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiryotp = new Date(Date.now() + 20 * 3000);
  let user = await User.find({ phone: req.body.phone });

  // if (
  //   req.body.phone.toString().length > 11 &&
  //   req.body.phone.toString().length !== 11
  // ) {
  //   return res.status(404).json({
  //     status: "error",
  //     message: "Please enter correct mobile number!",
  //   });
  // } else
  if (user == "") {
    return res.status(404).json({
      status: "error",
      message: "User not found!",
    });
  }
  // else if (user[0].position != "user_admin") {
  //   return res.status(404).json({
  //     status: "error",
  //     message: "User should be a valid user!",
  //   });
  // }
  else if (req.body.phone.toString().length == 0) {
    res.status(400).json({
      status: "error",
      message: `Please enter phone number!`,
    });
  } else {
    // send OTP on Mobile
    var smsMessage = new api.SmsMessage();

    smsMessage.from = 9079380612;
    smsMessage.to = req.body.phone;
    smsMessage.body = otp;

    var smsApi = new api.SMSApi(
      "dcarr@pclimports.com",
      "9DC7718D-51D3-E111-3CB2-E6EA8E16C6E3"
    );

    var smsCollection = new api.SmsMessageCollection();

    smsCollection.messages = [smsMessage];

    smsApi
      .smsSendPost(smsCollection)
      .then(function (response) {})
      .catch(function (err) {
        console.error(err.body);
      });

    // update data
    await User.updateMany({ otp, expiryotp });

    return res.status(200).json({
      id: user._id,
      otp,
      status: "success",
      message: "OTP sent successfully!",
    });
  }
};

// Forget Password ----
// Verify OTP ----
// -----------------------
exports.verifyForgotOTP = async (req, res) => {
  const crunenttime = Date.now();

  const matchotp = await User.findOne({ phone: req.body.phone });
  const token = signToken(matchotp._id);

  if (!matchotp) {
    return res.status(400).json({
      status: "error",
      message: "OTP does not match!",
    });
  }
  if (matchotp.expiryotp < crunenttime) {
    return res.status(401).json({
      status: "error",
      message: "OTP Expired!",
    });
  }
  if (matchotp.otp === req.body.otp) {
    return res.status(200).json({
      token: token,
      position: matchotp.position,
      id: matchotp._id,
      status: "success",
      message: "OTP verified successfully!",
    });
  } else {
    return res.status(400).json({
      status: "error",
      message: "Please try again",
    });
  }
};

// Forget Password ----
// Reset Password ----
// -----------------------
exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found!", 400));
  }
  user.password = req.body.password;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
    user,
  });
});

// Forget Password ----
// Update Password ----
// -----------------------
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const body = req.body;

  const { currentPassword, password } = req.body;

  //If email and pass exist
  if (!currentPassword || !password) {
    return next(
      new AppError("Please provide us current password and new password!", 400)
    );
  }

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Incorrect current password!", 401));
  }

  user.password = req.body.password;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password changed successfully!",
    user,
  });
});
