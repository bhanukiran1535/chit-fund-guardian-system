const express = require('express');
const PaymentRouter = express.Router();
const Month = require('../Models/MonthDetails');
const userAuth = require('../middlewares/userAuth');

// POST /payment/make
PaymentRouter.post('/make',userAuth, async (req, res) => {
  try {
    const userId = req.user._id; // Make sure you’re using authentication middleware
    const { groupId, monthName, paymentMethod, paymentDate } = req.body;

    // Find the relevant month record
    const month = await Month.findOne({
      userId,
      groupId,
      monthName
    });

    if (!month) {
      return res.status(404).json({ success: false, message: 'Month entry not found.' });
    }

    // Update payment status and details
    month.status = 'paid';
    month.paymentMethod = paymentMethod;
    month.paymentDate = new Date(paymentDate);
    
    await month.save();

    res.json({ success: true, message: 'Payment recorded successfully.' });
  } catch (error) {
    console.error('Error making payment:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
});

module.exports = PaymentRouter;
