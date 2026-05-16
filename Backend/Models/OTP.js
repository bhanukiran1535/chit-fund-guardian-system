const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiry: { type: Date, required: true },
});

// Indexes for OTP lookups and automatic expiry cleanup
otpSchema.index({ email: 1 });
otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

module.exports = mongoose.model('Otp', otpSchema);
