const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, required: true }, // or phone
    otpHash: { type: String, required: true }, // hash the OTP with bcrypt
    attempts: { type: Number, default: 0 }, // track failed attempts
    createdAt: { type: Date, default: Date.now, expires: 300 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('OtpToken', otpTokenSchema);