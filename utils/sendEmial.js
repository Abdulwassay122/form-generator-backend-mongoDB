const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: 'awassay122598@gmail.com',
        pass: "ifyc stul fzmw brvk", // use App Password if Gmail
      },
    });

    const mailOptions = {
      from: 'awassay122598@gmail.com',
      to:email,
      subject: "Verify Your Email - EasyForm",
        html:`<p>This Otp is Valid For 5 Minutes to verify your email. <br/> ${otp} </p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = { sendEmail };
