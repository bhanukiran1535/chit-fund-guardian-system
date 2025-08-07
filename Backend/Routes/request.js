
const express = require('express');
const requestRoute = express.Router();
const Request = require('../Models/Request');
const userAuth = require('../middlewares/userAuth');
const adminAuth = require('../middlewares/adminAuth');
const { addMemberToGroup } =require('../Utils/addMemberToGroup');
const Group = require('../Models/Group');
const { body, validationResult } = require('express-validator');
const AuditLog = require('../Models/AuditLog');

// POST /request/join
requestRoute.post('/join', userAuth, [
  body('amount').isNumeric().withMessage('Amount is required and must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    } 

    // Check if user already has a pending join request
    const existing = await Request.findOne({ 
      userId: req.user._id, 
      type: 'join_group', 
      status: 'pending' 
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have a pending join request' });
    }

    const request = await Request.create({
      userId: req.user._id,
      amount,
      type: 'join_group'
    });
    res.status(201).json({ success: true, message: 'Join request submitted', request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

requestRoute.get('/my', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = (await Request.find({ userId }).sort({ createdAt: -1 }).populate('groupId', 'groupNo'));
    res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


requestRoute.post('/withdraw', userAuth, [
  body('amount').isNumeric().withMessage('Amount is required and must be a number'),
  body('type').notEmpty().withMessage('Type is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const userId = req.user._id;
    const { amount, type } = req.body;

    const result = await Request.findOneAndDelete({
      userId,
      amount,
      type,
      status: 'pending'
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'No pending request found for withdrawal'
      });
    }

    res.json({ success: true, message: 'Request withdrawn successfully' });
  } catch (err) {
    console.error('Error withdrawing request:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// @route POST /request/prebook
requestRoute.post('/prebook', userAuth, [
  body('groupId').isMongoId().withMessage('Group ID is required'),
  body('monthName').notEmpty().withMessage('Month name is required'),
  body('shareAmount').isNumeric().withMessage('Share amount is required and must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { groupId, monthName, shareAmount } = req.body;
  const userId = req.user._id;

  if (!groupId || !monthName || !shareAmount) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const existing = await Request.findOne({
      userId,
      groupId,
      monthName,
      type: 'month_prebook',
      status: 'pending'
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Prebook request already exists' });
    }

    const request = new Request({
      userId,
      groupId,
      type: 'month_prebook',
      monthName,
      amount: shareAmount
    });

    await request.save();
    res.json({ success: true, message: 'Prebook request sent' });
  } catch (err) {
    console.error('Error creating prebook request:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 2. Send Payment Confirmation Request
requestRoute.post('/payment', userAuth, [
  body('groupId').isMongoId().withMessage('Group ID is required'),
  body('monthName').notEmpty().withMessage('Month name is required'),
  body('amount').isNumeric().withMessage('Amount is required and must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { groupId, monthName, amount } = req.body;
    const newRequest = new Request({
      userId: req.user._id,
      groupId,
      type: 'confirm_cash_payment',
      monthName,
      amount
    });
    await newRequest.save();
    res.status(200).json({ success: true, message: 'Payment confirmation request sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Send Leave Group Request
requestRoute.post('/leave', userAuth, [
  body('groupId').isMongoId().withMessage('Group ID is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const { groupId } = req.body;
    const newRequest = new Request({
      userId: req.user._id,
      groupId,
      type: 'leave_group'
    });
    await newRequest.save();
    res.status(200).json({ success: true, message: 'Leave group request sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Admin - View All Pending Requests
requestRoute.get('/pending',userAuth,adminAuth, async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('userId','firstName email')
      .populate('groupId', 'groupNo');
    const formatted = requests.map(req => ({
      id: req._id,
      type: req.type,
      user: req.userId?.firstName || 'Unknown',
      email: req.userId?.email || '',
      groupId: req.groupId|| '',
      amount: req.amount,
      message: generateMessage(req),
      timestamp: req.createdAt,
      status: req.status
    }));

    res.json({ success: true, requests: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
  }
});

// Helper function to auto-generate message if none is set
function generateMessage(req) {
  switch (req.type) {
    case 'join_group': return `Request to join a group (₹${req.amount?.toLocaleString() || '—'})`;
    case 'leave_group': return 'Request to leave group';
    case 'confirm_cash_payment': return `Cash payment confirmation for ${req.monthName}`;
    case 'month_prebook': return `Pre-book payout for ${req.monthName}`;
    default: return 'Request';
  }
}

// ✅ 2. POST /request/approve
requestRoute.post('/approve', userAuth, adminAuth, [
  body('requestId').isMongoId().withMessage('Request ID is required'),
  body('seclectedgroupId').optional().isMongoId().withMessage('Group ID must be valid'),
  body('groupId').optional().isMongoId().withMessage('Group ID must be valid'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { requestId, seclectedgroupId, groupId} = req.body;
  if (!requestId) {
    return res.status(400).json({ success: false, message: 'Request ID is required' });
  }
  try {
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    
    if (request.type === 'month_prebook') {
          const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const member = group.members.find(m => m.userId.toString() === request.userId.toString());
    if (!member) {
      return res.status(400).json({ success: false, message: 'User is not a member of this group' });
    }
    // ✅ Mark the member’s preBookedMonth
    member.preBookedMonth = request.monthName;
    
    // ✅ Save group and request
    await group.save();
    request.status = 'approved';
    await request.save();

    await AuditLog.create({ action: 'approve_request', performedBy: req.user._id, targetId: requestId, details: { type: request.type, userId: request.userId, groupId: request.groupId, status: request.status } });

    return res.json({ success: true, message: 'Pre-book request approved' });
  }
    // ✅ If request type is join_group, add user to group + generate dues
    if (request.type === 'join_group'){
      if (!seclectedgroupId) {
        return res.status(400).json({ success: false, message: 'Group ID is required to approve join_group request' });
      }

      const group = await Group.findById(seclectedgroupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      // ✅ Add user to group.members
      const alreadyMember = group.members.find(m => m.userId.toString() === request.userId.toString());
      if (alreadyMember) {
        return res.status(400).json({ success: false, message: 'User is already a member of this group' });
      }
        // Generate monthlydetails records
      const result = await addMemberToGroup(group, request.userId, request.amount);
      if(!result.success) return res.status(500).json({ success: false, message: result.message })
    }
    
    // ✅ If request type is confirm_cash_payment, mark month as paid
    if (request.type === 'confirm_cash_payment') {
      const Month = require('../Models/MonthDetails');
      const monthDoc = await Month.findOne({
        userId: request.userId,
        groupId: request.groupId,
        monthName: request.monthName
      });
      if (!monthDoc) {
        return res.status(404).json({ success: false, message: 'Month entry not found for cash confirmation.' });
      }
      monthDoc.status = 'paid';
      monthDoc.paymentMethod = 'cash';
      await monthDoc.save();
      request.status = 'approved';
      await request.save();
      await AuditLog.create({ action: 'approve_request', performedBy: req.user._id, targetId: requestId, details: { type: request.type, userId: request.userId, groupId: request.groupId, status: request.status } });
      return res.json({ success: true, message: 'Cash payment confirmed and marked as paid.' });
    }

    // ✅ If request type is leave_group, remove user from group and delete all their MonthDetails
    if (request.type === 'leave_group') {
      const Group = require('../Models/Group');
      const Month = require('../Models/MonthDetails');
      const group = await Group.findById(request.groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found for leave request.' });
      }
      // Remove user from group.members
      group.members = group.members.filter(m => m.userId?.toString() !== request.userId.toString());
      await group.save();
      // Delete all MonthDetails for this user in this group
      await Month.deleteMany({ userId: request.userId, groupId: request.groupId });
      request.status = 'approved';
      await request.save();
      await AuditLog.create({ action: 'approve_request', performedBy: req.user._id, targetId: requestId, details: { type: request.type, userId: request.userId, groupId: request.groupId, status: request.status } });
      return res.json({ success: true, message: 'User removed from group and all month records deleted.' });
    }
    
    // ✅ Approve the request
    request.groupId = seclectedgroupId;
    request.status = 'approved';
    await request.save();

    await AuditLog.create({ action: 'approve_request', performedBy: req.user._id, targetId: requestId, details: { type: request.type, userId: request.userId, groupId: request.groupId, status: request.status } });

    res.json({ success: true, message: 'Request approved and user added to group' });
  }catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve request' });
  }
});


// ✅ 3. POST /request/reject
requestRoute.post('/reject',userAuth,adminAuth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ success: false, message: 'Request ID is required' });
  }

  try {
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    request.status = 'rejected';
    await request.save();

    await AuditLog.create({ action: 'reject_request', performedBy: req.user._id, targetId: requestId, details: { type: request.type, userId: request.userId, groupId: request.groupId, status: request.status } });

    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to reject request' });
  }
});

module.exports = requestRoute;