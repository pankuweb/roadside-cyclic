const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "pankajittechxpert@gmail.com",
      pass: "PHP$work!@#",
    },
  });

  // 2) Define the email options
  let mailOptions = {
    from: "pankajittechxpert@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  try {
    const data = await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.log("api error ====", error);
  }
};

module.exports = sendEmail;
