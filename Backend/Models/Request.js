const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: false },

  type: { 
    type: String, 
    enum: ['join_group', 'leave_group', 'confirm_cash_payment','month_prebook'], 
    required: true 
  },

  monthName: {
    type: String, // e.g., "June 2025"
  },
  amount: { type: Number }, // requested amount (for payment/join)

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  createdAt: { type: Date, default: Date.now }
});

// Optimized indexes for better query performance
RequestSchema.index({ userId: 1, status: 1 });
RequestSchema.index({ groupId: 1, status: 1 });
RequestSchema.index({ type: 1, status: 1 });
RequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', RequestSchema);