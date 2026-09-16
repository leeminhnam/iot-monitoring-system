const Action = require('../models/action');

const getActionHistoryService = async ({ time, deviceId, status, action }, page = 1, limit = 10) => {
  const query = {};

  if (time) {
    query.$expr = {
      $regexMatch: {
        input: {
          $dateToString: {
            format: "%d/%m/%Y %H:%M:%S",
            date: "$time",
            timezone: "Asia/Ho_Chi_Minh"
          }
        },
        regex: time,
        options: "i"
      }
    };
  }

  if (deviceId) {
    query.deviceId = deviceId;
  }

  if (status) {
    query.status = status;
  }

  if (action) {
    query.action = action;
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