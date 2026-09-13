const Action = require('../models/action');

const getActionHistoryService = async ({ time }, page = 1, limit = 10) => {
  const query = {};

  if (time) {
    const parsedTime = new Date(time);
    if (!isNaN(parsedTime.getTime())) {
      const nextDay = new Date(parsedTime);
      nextDay.setDate(nextDay.getDate() + 1);
      query.time = { $gte: parsedTime, $lt: nextDay };
    }
  }

  const skip = (page - 1) * limit;

  const data = await Action.find(query)
    .populate('deviceId', 'name')
    .sort({ time: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Action.countDocuments(query);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

module.exports = {
  getActionHistoryService
};