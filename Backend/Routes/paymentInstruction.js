const express = require('express');
const router = express.Router();
const PaymentInstruction = require('../Models/PaymentInstruction');
const Group = require('../Models/Group');
const userAuth = require('../middlewares/userAuth');
const adminAuth = require('../middlewares/adminAuth');

// GET /payment-instruction/:groupId/:monthName  (member view)
// Returns instruction ONLY if the current user is in visibleTo.
// Otherwise returns { success: true, instruction: null } — no placeholder leakage.
router.get('/:groupId/:monthName', userAuth, async (req, res) => {
  try {
    const { groupId, monthName } = req.params;
    const userId = req.user._id;

    const instr = await PaymentInstruction.findOne({ groupId, monthName }).lean();
    if (!instr) return res.json({ success: true, instruction: null });

    const isAdmin = req.user.isAdmin;
    const visible = (instr.visibleTo || []).some(id => id.toString() === userId.toString());
    if (!isAdmin && !visible) return res.json({ success: true, instruction: null });

    res.json({ success: true, instruction: instr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /payment-instruction/admin/:groupId/:monthName  (admin full view incl. visibleTo list)
router.get('/admin/:groupId/:monthName', userAuth, adminAuth, async (req, res) => {
  try {
    const { groupId, monthName } = req.params;
    const instr = await PaymentInstruction.findOne({ groupId, monthName }).lean();
    const group = await Group.findById(groupId)
      .populate('members.userId', 'firstName lastName email')
      .lean();
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const eligibleMembers = (group.members || [])
      .filter(m => m.status !== 'left' && m.userId)
      .map(m => ({
        _id: m.userId._id,
        firstName: m.userId.firstName,
        lastName: m.userId.lastName,
        email: m.userId.email,
      }));
    res.json({ success: true, instruction: instr || null, members: eligibleMembers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /payment-instruction/:groupId/:monthName  (admin upsert)
router.put('/:groupId/:monthName', userAuth, adminAuth, async (req, res) => {
  try {
    const { groupId, monthName } = req.params;
    const {
      recipientName = '', upiId = '', bankName = '', accountNumber = '',
      ifsc = '', phone = '', notes = '', visibleTo = []
    } = req.body;

    const update = {
      recipientName, upiId, bankName, accountNumber, ifsc, phone, notes,
      visibleTo: Array.isArray(visibleTo) ? visibleTo : [],
      updatedBy: req.user._id,
    };
    const instr = await PaymentInstruction.findOneAndUpdate(
      { groupId, monthName },
      { $set: update, $setOnInsert: { groupId, monthName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: 'Payment instruction saved.', instruction: instr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /payment-instruction/:groupId/:monthName  (admin)
router.delete('/:groupId/:monthName', userAuth, adminAuth, async (req, res) => {
  try {
    const { groupId, monthName } = req.params;
    await PaymentInstruction.deleteOne({ groupId, monthName });
    res.json({ success: true, message: 'Payment instruction removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
