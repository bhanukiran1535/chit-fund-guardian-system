const express = require('express');
const PaymentRouter = express.Router();
const Month = require('../Models/MonthDetails');
const userAuth = require('../middlewares/userAuth');
const { body, validationResult } = require('express-validator');

// POST /payment/make
PaymentRouter.post('/make', userAuth, [
  body('groupId').isMongoId().withMessage('Group ID is required'),
  body('monthName').notEmpty().withMessage('Month name is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('paymentDate').isISO8601().withMessage('Payment date must be a valid date'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const userId = req.user._id;
    const { groupId, monthName, paymentMethod, paymentDate } = req.body;
    const month = await Month.findOne({
      userId,
      groupId,
      monthName
    });
    if (!month) {
      return res.status(404).json({ success: false, message: 'Month entry not found.' });
    }
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
