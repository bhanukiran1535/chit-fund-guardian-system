const mongoose = require('mongoose');
const UserModel = require('./User');

const GroupSchema = new mongoose.Schema({
  // status - active,completed,upcoming
  groupNo:{
    type: String,
    required: true,
    
  },
  chitValue: {  // Total amount pooled monthly
    type: Number,
    required: true
  }, 
  startMonth:{
    type: Date,
    required: true
  },
  tenure: {
    type: Number,
    required: true
  },
  members: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shareAmount: { type: Number, required: true }, // 1L, 2L etc.
    status: { type: String, enum: ['active', 'left'], default: 'active' },
    preBookedMonth: { type: String}, // e.g., "July 2025"
  }
],
foremanCommission:{
    type: Number,  // % percentage
    required: true
}
}, { timestamps: true })
GroupSchema.index({ groupNo: 1 }, { unique: true });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ startMonth: 1 });
GroupSchema.index({ chitValue: 1 });
GroupSchema.index({ startMonth: 1, chitValue: 1 }); // Compound index for common queries
const GroupModel = mongoose.model('Group',GroupSchema);
module.exports = GroupModel;

//Bid amount / Auction amount
// Foreman's commission	Fee taken by the organizer (usually 5%)