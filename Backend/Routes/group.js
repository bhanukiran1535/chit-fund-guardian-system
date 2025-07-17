const express = require("express");
const groupRoute = express.Router();
const userAuth = require('../middlewares/userAuth');
const adminAuth = require('../middlewares/adminAuth');
const Group = require('../Models/Group');
const {addMemberToGroup} = require('../Utils/addMemberToGroup');

  groupRoute.post('/create', userAuth, adminAuth, async (req, res) => {
    try {
      // Find the latest group by groupNo (descending order)
      const latestGroup = await Group.findOne().sort({ groupNo: -1 });

      let newGroupNo = 'G001';

      if (latestGroup && typeof latestGroup.groupNo === 'string' && /^G\d+$/.test(latestGroup.groupNo)) {
        const latestNumber = parseInt(latestGroup.groupNo.slice(1)); // Removes 'G' and parses number
        const nextNumber = latestNumber + 1;
        newGroupNo = `G${String(nextNumber).padStart(3, '0')}`;
      }

      const newGroupData = {
        ...req.body,
        groupNo: newGroupNo, // Override groupNo if sent from frontend
      };

      const group = await Group.create(newGroupData);

      res.status(200).json({ success: true, groupDetails: group });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  });



// GET /allGroups?status=upcoming|active|completed
groupRoute.get('/allGroups', async (req, res) => {
  try {
    const { status } = req.query;
    const currentDate = new Date();

    const allGroups = await Group.find().select('-__v -updatedAt -createdAt -foremanCommission')
                                        .populate('members.userId', 'firstName email');
    // Attach status to each group
    const groupsWithStatus = allGroups.map(group => {
      const groupStart = new Date(group.startMonth);
      const groupEnd = new Date(groupStart);
      groupEnd.setMonth(groupEnd.getMonth() + group.tenure);
      
      let computedStatus = '';
      if (groupStart > currentDate) computedStatus = 'upcoming';
      else if (groupStart <= currentDate && groupEnd >= currentDate) computedStatus = 'active';
      else if (groupEnd < currentDate) computedStatus = 'completed';
      return { ...group.toObject(), status: computedStatus };
    });

    // Filter based on query param if provided
    const filteredGroups = status
      ? groupsWithStatus.filter(group => group.status === status)
      : groupsWithStatus;
    res.status(200).json({ success: true, groups: filteredGroups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

groupRoute.get('/my', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ "members.userId": userId })
      .select('-__v -createdAt -updatedAt -foremanCommission')
      .lean(); // use lean for better performance and easier manipulation

    // Filter each group's members array to include only the current user
    const userGroups = groups.map(group => {
      const userMember = group.members.find(m => m.userId.toString() === userId.toString());
      return {
        ...group,
        members: [userMember] // Keep only current user’s info
      };
    });

    res.status(200).json({ success: true, groups: userGroups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


groupRoute.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    let groups;
    const currentDate = new Date();

    if (status === 'upcoming') {
      groups = await Group.find({
        startMonth: { $gt: currentDate },
      }).sort({ startMonth: 1 });
    } else if (status === 'active') {
      groups = await Group.find({
        startMonth: { $lte: currentDate },
        $expr: { $lt: [{ $size: "$members" }, "$tenure"] },
      }).sort({ startMonth: -1 });
    } else if (status === 'completed') {
      groups = await Group.find({
        $expr: { $eq: [{ $size: "$members" }, "$tenure"] },
      }).sort({ startMonth: -1 });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    res.status(200).json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// routes/group.js or similar
groupRoute.get('/:groupId', userAuth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    res.json({ success: true, group, userId: req.user._id });
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// POST /group/:groupId/add-member
groupRoute.post('/:groupId/add-member',userAuth, adminAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ success: false, message: 'User ID and amount are required' });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const alreadyMember = group.members.find(m => m.userId.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'User is already a member of this group' });
    }
    // Generate monthlydetails records
    addMemberToGroup(group, userId, amount);
    res.status(200).json({ success: true, message: 'Member added to group' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


groupRoute.patch('/leave/:groupid', userAuth, async (req, res) => {
  try {
    const groupId = req.params.groupid;
    const userId = req.user._id;

    // Find the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some(memberId => memberId.equals(userId));
    if (!isMember) {
      return res.status(400).json({ success: false, message: "You are not a member of this group" });
    }
    // can't leave Now
    if (Date.now() >= new Date(group.startMonth).getTime()) {
      return res.status(400).json({ success: false, message: "This group has started you can't leave now" });
    }
    // Remove the user from members
    group.members = group.members.filter(memberId => !memberId.equals(userId));
    await group.save();
    
    return res.status(200).json({ success: true, message: "You have left the group", group });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = groupRoute;

