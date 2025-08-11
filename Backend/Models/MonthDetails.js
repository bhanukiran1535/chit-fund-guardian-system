const mongoose = require('mongoose');

const MonthSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  monthName: {
    type: String, // e.g., "June 2025"
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'due', 'paid', 'pending'],
    default: 'upcoming'
  },
  monthDue:{
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String
  },
  paymentDate: { 
    type: Date
  }
}, { timestamps: true });

// Optimized compound indexes for better query performance
MonthSchema.index({ groupId: 1, monthName: 1 }); // Compound index for common queries
MonthSchema.index({ userId: 1, status: 1 }); // Compound index for user status queries
MonthSchema.index({ groupId: 1, status: 1 }); // Index for group status queries
MonthSchema.index({ paymentDate: -1 }); // Index for payment date sorting

module.exports = mongoose.model('Month', MonthSchema);
