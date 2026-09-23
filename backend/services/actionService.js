const Action = require('../models/action');
const Device = require('../models/device');

const getActionHistoryService = async ({ time, deviceName, status, action }, page = 1, limit = 10) => {
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

  if (deviceName) {
    const matchedDevices = await Device.find({
      name: { $regex: deviceName, $options: 'i' }
    }).select('_id');
    const deviceIds = matchedDevices.map(d => d._id);
    query.deviceId = { $in: deviceIds };
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