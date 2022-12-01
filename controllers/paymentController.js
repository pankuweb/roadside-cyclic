const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeKey = process.env.STRIPE_SECRET_KEY;
const catchAsync = require("../utils/catchAsync");

// -----------------
//Route handdlers
// -----------------

// Create customer on stripe ----
// -----------------------
exports.createCustomer = catchAsync(async (req, res, next) => {
  try {
    const customer = await stripe.customers.create({
      name: req.body.name,
      email: req.body.email,
    });

    res.status(200).json({
      message: "success",
      message: "Customer created successfully!",
      result: {
        customer,
      },
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

// Create card using customer id on stripe ----
// -----------------------
exports.createCard = catchAsync(async (req, res, next) => {
  const {
    customerId,
    cardName,
    cardExpYear,
    cardExpMonth,
    cardNumber,
    cardCVC,
  } = req.body;
  try {
    const token = await stripe.tokens.create({
      card: {
        name: cardName,
        number: cardNumber,
        exp_month: cardExpMonth,
        exp_year: cardExpYear,
        cvc: cardCVC,
      },
    });
    const card = await stripe.customers.createSource(customerId, {
      source: token.id,
    });

    res.status(200).json({
      message: "success",
      message: "Card created successfully!",
      result: {
        card: card.id,
      },
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});

// Create payment using customer id and card id on stripe ----
// -----------------------
exports.createCharges = catchAsync(async (req, res, next) => {
  try {
    const charge = await stripe.charges.create({
      receipt_email: req.body.email,
      amount: req.body.amount * 100,
      currency: "INR",
      card: req.body.cardID,
      customer: req.body.customerID,
      description: req.body.description,
    });

    res.status(200).json({
      message: "success",
      message: "Payment Successful!",
      result: {
        charge: charge,
      },
    });
    next();
  } catch (error) {
    throw new Error(error);
  }
});
