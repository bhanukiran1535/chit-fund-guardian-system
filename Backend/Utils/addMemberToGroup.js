const Group = require('../Models/Group');
const Month = require('../Models/MonthDetails');


function generateMonths(startDate, tenure, groupId, userId,shareAmount) {
  const months = [];
  const start = new Date(startDate);
  const today = new Date();

  if (isNaN(start)) {
    throw new Error("Invalid start date passed to generateMonths");
  }
  const monthlyDue = Math.round(shareAmount / tenure); // 💰 Even split

  for (let i = 0; i < tenure; i++) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1); // 1st of each month
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear(); // e.g., 2024-07

    let status;
    if (
      date.getFullYear() < today.getFullYear() ||
      (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth())
    ) {
      status = "due";
    } else if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth()
    ) {
      status = "pending";
    } else {
      status = "upcoming";
    }

    months.push({
      groupId,
      userId,
      monthName: `${monthName} ${year}`,
      status,
      monthDue: monthlyDue, // ✅ Use dueAmount field properly
    });
  }

  return months;
}

const addMemberToGroup = async (group, userId, amount) => {
  const mongoose = require('mongoose');
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    group.members.push({
      userId,
      shareAmount: amount
    });
    await group.save({ session });
    const monthEntries = generateMonths(group.startMonth, group.tenure, group._id, userId, amount);
    await Month.insertMany(monthEntries, { session });
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: 'Member added and payments generated' };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return { success: false, message: err.message };
  }
};

module.exports = { addMemberToGroup };
