const express = require('express');
const monthRoute = express.Router();
const Month = require('../Models/MonthDetails');
const userAuth = require('../middlewares/userAuth');

// POST /month/my
monthRoute.post('/my', userAuth, async (req, res) => {
  const { groupIds } = req.body;
  const userId = req.user._id;

  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Group IDs are required' });
  }
 
  try {
    const months = await Month.find({
      userId,
      groupId: { $in: groupIds }
    }).select('-__v -createdAt -updatedAt') // 1 = ascending, -1 = descending

    res.json({ success: true, months });
  } catch (err) {
    console.error('Error fetching month data:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch month records' });
  }
});

module.exports = monthRoute;
