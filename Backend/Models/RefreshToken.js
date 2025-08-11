const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);