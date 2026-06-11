const mongoose = require('mongoose');

const PaymentInstructionSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  monthName: { type: String, required: true }, // e.g. "July 2026"
  recipientName: { type: String, default: '' },
  upiId: { type: String, default: '' },
  bankName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifsc: { type: String, default: '' },
  phone: { type: String, default: '' },
  notes: { type: String, default: '' },
  // Targeted visibility: only these userIds may view this instruction.
  // Empty array means visible to NO ONE (admin hasn't published yet).
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

PaymentInstructionSchema.index({ groupId: 1, monthName: 1 }, { unique: true });

module.exports = mongoose.model('PaymentInstruction', PaymentInstructionSchema);
