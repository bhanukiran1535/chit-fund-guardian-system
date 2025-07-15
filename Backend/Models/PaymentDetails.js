const mongoose = require('mongoose');

PaymentSchema = new mongoose.Schema({
  amount:{
    type: Number,
    required:true
  },
  paidBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, 
  },
  group:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true, 
  },
  monthIndex: Number,
  method:{
    type: String,
    enum:['Cash','UPI','BankTransfer'],
    required: true, 
  },
  status:{
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  }
}, { timestamps: true })

const PaymentModel = mongoose.model('Payment',PaymentSchema);
module.exports = PaymentModel;